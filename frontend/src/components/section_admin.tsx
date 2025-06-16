import React, { useState, useEffect, useRef } from "react";
import { fetchJoinedTracks, JoinedTrack, deleteTrack } from "../services/trackService";
import "../styles/admin.css";

const imageModules = import.meta.glob("../assets/images/*.{png,jpg,jpeg,svg}", {
  eager: true,
  as: "url",
});
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split("/").pop();
  if (filename) imageMap[filename] = url as string;
});

const Section_admin: React.FC = () => {
  const [tracks, setTracks] = useState<JoinedTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<JoinedTrack[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allChecked, setAllChecked] = useState(false);
  const [checkedRows, setCheckedRows] = useState<Record<number, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchJoinedTracks();

        // Không còn lọc theo status
        setTracks(data);
        setFilteredTracks(data);

        const init: Record<number, boolean> = {};
        data.forEach((t) => (init[t.id] = false));
        setCheckedRows(init);
        setAllChecked(false);
      } catch (err) {
        console.error("Lỗi khi fetch joined tracks:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = term
      ? tracks.filter((t) => {
          const title = (t.Metadatum?.trackname || `Track ${t.id}`).toLowerCase();
          const artist = t.User?.UploaderName?.toLowerCase() || "";
          return title.includes(term) || artist.includes(term);
        })
      : [...tracks];
    setFilteredTracks(result);
    const init: Record<number, boolean> = {};
    result.forEach((t) => (init[t.id] = false));
    setCheckedRows(init);
    setAllChecked(false);
  }, [searchTerm, tracks]);

  const handleSort = (option: string) => {
    let sorted = [...filteredTracks];
    switch (option) {
      case "name-asc":
        sorted.sort((a, b) =>
          (a.Metadatum?.trackname || "").localeCompare(b.Metadatum?.trackname || "")
        );
        break;
      case "name-desc":
        sorted.sort((a, b) =>
          (b.Metadatum?.trackname || "").localeCompare(a.Metadatum?.trackname || "")
        );
        break;
      case "date-asc":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "date-desc":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "played-asc":
        sorted.sort(
          (a, b) =>
            (a.listeningHistories[0]?.listenCount || 0) -
            (b.listeningHistories[0]?.listenCount || 0)
        );
        break;
      case "played-desc":
        sorted.sort(
          (a, b) =>
            (b.listeningHistories[0]?.listenCount || 0) -
            (a.listeningHistories[0]?.listenCount || 0)
        );
        break;
      default:
        return;
    }
    setFilteredTracks(sorted);
    setFilterOpen(false);
  };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAllChecked(checked);
    const updated: Record<number, boolean> = {};
    filteredTracks.forEach((t) => {
      updated[t.id] = checked;
    });
    setCheckedRows(updated);
  };

  const handleCheckRow = (id: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...checkedRows, [id]: e.target.checked };
    setCheckedRows(updated);
    setAllChecked(filteredTracks.every((t) => updated[t.id]));
  };

  const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "N/A");

  const maxListen =
    tracks.length > 0
      ? Math.max(...tracks.map((t) => t.listeningHistories[0]?.listenCount || 0))
      : 0;

  const selectedCount = Object.values(checkedRows).filter(Boolean).length;

  const handleDeleteSelected = async () => {
    const idsToDelete = Object.entries(checkedRows)
      .filter(([_, checked]) => checked)
      .map(([id]) => Number(id));

    if (!idsToDelete.length) return;

    if (!window.confirm(`Xác nhận xoá ${idsToDelete.length} tracks?`)) return;

    try {
      // Xoá tất cả các track đã chọn
      await Promise.all(idsToDelete.map((id) => deleteTrack(id)));

      // Lấy lại danh sách track sau khi xoá
      const data = await fetchJoinedTracks();

      // KHÔNG lọc theo status nữa — giữ toàn bộ
      setTracks(data);
      setFilteredTracks(data);

      // Reset lại các ô check
      const init: Record<number, boolean> = {};
      data.forEach((t) => (init[t.id] = false));
      setCheckedRows(init);
      setAllChecked(false);
    } catch (err) {
      console.error("Lỗi khi xoá tracks:", err);
      alert("Xoá không thành công. Vui lòng thử lại.");
    }
  };


  const handleDeleteRow = (id: number) => async () => {
    if (!window.confirm(`Xác nhận xoá track ID ${id}?`)) return;
    try {
      await deleteTrack(id);
      const newTracks = tracks.filter((t) => t.id !== id);
      setTracks(newTracks);
      setFilteredTracks((prev) => prev.filter((t) => t.id !== id));
      const updated = { ...checkedRows };
      delete updated[id];
      setCheckedRows(updated);
      setAllChecked(Object.values(updated).every(Boolean));
    } catch (err) {
      console.error(`Lỗi khi xoá track ${id}:`, err);
      alert("Xoá không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <section className="section_admin">
      <div className="user_management_header_admin">
        <div className="search_users_admin">
          <input
            type="text"
            placeholder="Search by track name or artist"
            className="search_input_users_admin"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="user_actions_admin">
          <span className="selected_count_admin">{selectedCount} Selected</span>
          <button
            className="delete_button_admin"
            disabled={selectedCount === 0}
            onClick={handleDeleteSelected}
          >
            Delete
          </button>
          <div className="filter_dropdown_admin" ref={filterRef}>
            <button
              className="filter_button_admin"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filter <span className="filter_badge_admin" />
            </button>
            {filterOpen && (
              <div className="filter_menu_admin" style={{ width: "100%", padding: "4px 0" }}>
                <div className="filter_option_admin" onClick={() => handleSort("name-asc")}>
                  A → Z
                </div>
                <div className="filter_option_admin" onClick={() => handleSort("name-desc")}>
                  Z → A
                </div>
                <div className="filter_option_admin" onClick={() => handleSort("date-asc")}>
                  Oldest First
                </div>
                <div className="filter_option_admin" onClick={() => handleSort("date-desc")}>
                  Newest First
                </div>
                <div className="filter_option_admin" onClick={() => handleSort("played-asc")}>
                  Played ↑
                </div>
                <div className="filter_option_admin" onClick={() => handleSort("played-desc")}>
                  Played ↓
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="users_table_admin">
        <div className="table_header_admin">
          <div className="table_cell_admin checkbox_cell_admin">
            <input
              type="checkbox"
              className="checkbox_admin"
              checked={allChecked}
              onChange={handleCheckAll}
            />
          </div>
          <div className="table_cell_admin name_cell_admin">Tracks</div>
          <div className="table_cell_admin position_cell_admin">Artist</div>
          <div className="table_cell_admin country_cell_admin">Posting date</div>
          <div className="table_cell_admin status_cell_admin">Status</div>
          <div className="table_cell_admin portfolio_cell_admin">Played</div>
          <div className="table_cell_admin action_cell_admin" />
        </div>

        {filteredTracks.map((t) => {
          const title = t.Metadatum?.trackname || `Track ${t.id}`;
          const fileName = t.imageUrl?.split("/").pop() || "";
          const imgSrc = imageMap[fileName] || "";
          const statusClass = "status_active_admin";
          const statusText = "Approved";
          const listenCount = t.listeningHistories[0]?.listenCount || 0;

          return (
            <div className="table_row_admin" key={t.id}>
              <div className="table_cell_admin checkbox_cell_admin">
                <input
                  type="checkbox"
                  className="checkbox_admin"
                  checked={checkedRows[t.id] || false}
                  onChange={handleCheckRow(t.id)}
                />
              </div>
              <div className="table_cell_admin name_cell_admin">
                <div className="user_info_admin">
                  <img
                    src={imgSrc}
                    alt={title}
                    className="user_avatar_table_admin"
                  />
                  <div className="user_details_admin">
                    <div className="user_name_admin">{title}</div>
                    <div className="user_email_admin">ID: {t.id}</div>
                  </div>
                </div>
              </div>
              <div className="table_cell_admin position_cell_admin">
                {t.User?.UploaderName || "N/A"}
              </div>
              <div className="table_cell_admin country_cell_admin">
                {formatDate(t.createdAt)}
              </div>
              <div className="table_cell_admin status_cell_admin">
                <span className={`status_badge_admin ${statusClass}`}>
                  <span className="status_dot_admin" /> {statusText}
                </span>
              </div>
              <div className="table_cell_admin portfolio_cell_admin">
                <div className="portfolio_info_admin">
                  <div className="portfolio_percent_admin">{listenCount}</div>
                  {maxListen > 0 && (
                    <div className="progress_bar_container_admin">
                      <div
                        className="progress_bar_admin"
                        style={{
                          width: `${(listenCount / maxListen) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="table_cell_admin action_cell_admin">
                <button
                  className="delete_row_button_admin"
                  onClick={handleDeleteRow(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Section_admin;