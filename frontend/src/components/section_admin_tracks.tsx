import React, { useState, useEffect, useRef } from "react";
import {
  fetchJoinedTracks,
  JoinedTrack,
  updateTrackStatus,
} from "../services/trackService";
import "../styles/admin.css";

const imageModules = import.meta.glob(
  "../assets/images/*.{png,jpg,jpeg,svg}",
  { eager: true, as: "url" }
);
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split("/").pop();
  if (filename) imageMap[filename] = url as string;
});

const Section_admin_tracks: React.FC = () => {
  const [tracks, setTracks] = useState<JoinedTrack[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [checkedRows, setCheckedRows] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const loadPending = async () => {
    try {
      const data = await fetchJoinedTracks();
      const pending = data.filter((t) => t.status === "pending");
      setTracks(pending);
      const initChecks: Record<number, boolean> = {};
      pending.forEach((t) => (initChecks[t.id] = false));
      setCheckedRows(initChecks);
      setAllChecked(false);
    } catch (err) {
      console.error("Lỗi khi fetch joined tracks:", err);
    }
  };

  useEffect(() => {
    loadPending();
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

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "N/A";

  const displayedTracks = tracks.filter((t) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const name = (t.Metadatum?.trackname || `Track ${t.id}`).toLowerCase();
    const artist = t.User?.UploaderName?.toLowerCase() || "";
    return name.includes(term) || artist.includes(term);
  });

  const selectedCount = displayedTracks.filter((t) => checkedRows[t.id]).length;

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAllChecked(checked);
    const updated: Record<number, boolean> = {};
    displayedTracks.forEach((t) => {
      updated[t.id] = checked;
    });
    setCheckedRows((prev) => ({ ...prev, ...updated }));
  };

  const handleCheckRow = (id: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const updated = { ...checkedRows, [id]: checked };
    setCheckedRows(updated);
    setAllChecked(displayedTracks.every((t) => updated[t.id]));
  };

  const handleApproveClick = async (id: number) => {
    try {
      await updateTrackStatus(id, "approved");
      await loadPending();
    } catch (err) {
      console.error("Lỗi khi cập nhật status:", err);
    }
  };

  const handleDeleteClick = async (id: number) => {
    try {
      await updateTrackStatus(id, "rejected");
      await loadPending();
    } catch (err) {
      console.error("Lỗi khi cập nhật status:", err);
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(
        displayedTracks
          .filter((t) => checkedRows[t.id])
          .map((t) => updateTrackStatus(t.id, "approved"))
      );
      await loadPending();
    } catch (err) {
      console.error("Lỗi khi bulk approve:", err);
    }
  };

  const handleBulkReject = async () => {
    try {
      await Promise.all(
        displayedTracks
          .filter((t) => checkedRows[t.id])
          .map((t) => updateTrackStatus(t.id, "rejected"))
      );
      await loadPending();
    } catch (err) {
      console.error("Lỗi khi bulk reject:", err);
    }
  };

  const handleSort = (option: string) => {
    let sorted = [...tracks];
    switch (option) {
      case "name-asc":
        sorted.sort((a, b) =>
          (a.Metadatum?.trackname || "").localeCompare(
            b.Metadatum?.trackname || ""
          )
        );
        break;
      case "name-desc":
        sorted.sort((a, b) =>
          (b.Metadatum?.trackname || "").localeCompare(
            a.Metadatum?.trackname || ""
          )
        );
        break;
      case "date-asc":
        sorted.sort(
          (a, b) =>
            new Date(a.Metadatum?.release_date || "").getTime() -
            new Date(b.Metadatum?.release_date || "").getTime()
        );
        break;
      case "date-desc":
        sorted.sort(
          (a, b) =>
            new Date(b.Metadatum?.release_date || "").getTime() -
            new Date(a.Metadatum?.release_date || "").getTime()
        );
        break;
      default:
        break;
    }
    setTracks(sorted);
    setFilterOpen(false);
  };

  return (
    <section className="section_admin">
      <div className="user_management_header_admin">
        <div className="search_users_admin">
          <input
            type="text"
            placeholder="Search by track name or artist name"
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
            onClick={handleBulkReject}
          >
            Rejected
          </button>
          <button
            className="export_button_admin"
            disabled={selectedCount === 0}
            onClick={handleBulkApprove}
          >
            Approve
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
                <div className="filter_option_admin" onClick={() => handleSort("all")}>
                  All
                </div>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === TABLE === */}
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
          <div className="table_cell_admin action_cell_admin" />
        </div>

        {displayedTracks.map((t) => {
          const title = t.Metadatum?.trackname || `Track ${t.id}`;
          const fileName = t.imageUrl.split("/").pop()!;
          const imgSrc = imageMap[fileName] || "";
          const artist = t.User?.UploaderName || "N/A";
          const day = formatDate(t.createdAt);
          const statusClass = "status_pending_admin";
          const statusText = "Pending";

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
                <div className="position_title_admin">{artist}</div>
              </div>
              <div className="table_cell_admin country_cell_admin">{day}</div>
              <div className="table_cell_admin status_cell_admin">
                <span className={`status_badge_admin ${statusClass}`}>
                  <span className="status_dot_admin" /> {statusText}
                </span>
              </div>
              <div className="table_cell_admin action_cell_admin">
                <button
                  className="edit_button_admin"
                  disabled={!checkedRows[t.id]}
                  onClick={() => handleApproveClick(t.id)}
                >
                  Approve
                </button>
                <button
                  className="delete_row_button_admin"
                  disabled={!checkedRows[t.id]}
                  onClick={() => handleDeleteClick(t.id)}
                >
                  Rejected
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Section_admin_tracks;
