// src/components/Section_admin.tsx
import React, { useState, useEffect } from "react";
import { fetchJoinedTracks, JoinedTrack } from "../services/trackService"; // Sử dụng service mới :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
import "../styles/admin.css";

// 1) Import tất cả file ảnh trong src/assets/images
const imageModules = import.meta.glob(
  "../assets/images/*.{png,jpg,jpeg,svg}",
  { eager: true, as: "url" }
);
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split("/").pop();
  if (filename) imageMap[filename] = url as string;
});

const Section_admin: React.FC = () => {
  // Dữ liệu gốc và đã filter
  const [tracks, setTracks] = useState<JoinedTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<JoinedTrack[]>([]);

  // Search term
  const [searchTerm, setSearchTerm] = useState("");

  // Checkbox state
  const [allChecked, setAllChecked] = useState(false);
  const [checkedRows, setCheckedRows] = useState<Record<number, boolean>>({});

  // Lấy dữ liệu từ API mới, chỉ lấy những track approved
  useEffect(() => {
    fetchJoinedTracks()
      .then((data) => {
        const approved = data.filter((t) => t.track.status === "approved");
        setTracks(approved);
        setFilteredTracks(approved);

        // Khởi tạo checkbox
        const init: Record<number, boolean> = {};
        approved.forEach((t) => (init[t.track.id] = false));
        setCheckedRows(init);
        setAllChecked(false);
      })
      .catch((err) => console.error("Lỗi khi fetch joined tracks:", err));
  }, []);

  // Filter mỗi khi searchTerm hoặc tracks thay đổi
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = term
      ? tracks.filter((t) => {
          const title = (t.metadata?.trackname || `Track ${t.track.id}`).toLowerCase();
          const artist = t.track.User.UploaderName.toLowerCase();
          return title.includes(term) || artist.includes(term);
        })
      : [...tracks];

    setFilteredTracks(result);

    // Reset checkbox cho kết quả mới
    const init: Record<number, boolean> = {};
    result.forEach((t) => (init[t.track.id] = false));
    setCheckedRows(init);
    setAllChecked(false);
  }, [searchTerm, tracks]);

  // Tính giá trị lớn nhất để vẽ progress bar tương đối
  const maxListen =
    tracks.length > 0 ? Math.max(...tracks.map((t) => t.listenCount)) : 0;

  // Hàm xử lý check all / check từng dòng
  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAllChecked(checked);
    setCheckedRows(
      Object.fromEntries(Object.keys(checkedRows).map((k) => [Number(k), checked]))
    );
  };
  const handleCheckRow = (id: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...checkedRows, [id]: e.target.checked };
    setCheckedRows(updated);
    setAllChecked(Object.values(updated).every(Boolean));
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "N/A";
  const selectedCount = Object.values(checkedRows).filter(Boolean).length;
  const filterCount = filteredTracks.length;

  return (
    <section className="section_admin">
      {/* SEARCH + ACTIONS */}
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
          <button className="delete_button_admin" disabled={selectedCount === 0}>
            Delete
          </button>
          <button className="export_button_admin">Add</button>
          <button className="filter_button_admin">
            Filter <span className="filter_badge_admin">{filterCount}</span>
          </button>
        </div>
      </div>

      {/* TABLE (tiêu đề giữ nguyên) */}
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
          const title = t.metadata?.trackname || `Track ${t.track.id}`;
          const fileName = t.track.imageUrl.split("/").pop()!;
          const imgSrc = imageMap[fileName] || "";
          // Map status sang lớp CSS và text cho phù hợp
          const statusClass =
            t.track.status === "approved"
              ? "status_active_admin"
              : t.track.status === "pending"
              ? "status_pending_admin"
              : "status_rejected_admin";
          const statusText =
            t.track.status.charAt(0).toUpperCase() + t.track.status.slice(1);

          return (
            <div className="table_row_admin" key={t.track.id}>
              <div className="table_cell_admin checkbox_cell_admin">
                <input
                  type="checkbox"
                  className="checkbox_admin"
                  checked={checkedRows[t.track.id] || false}
                  onChange={handleCheckRow(t.track.id)}
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
                    <div className="user_email_admin">ID: {t.track.id}</div>
                  </div>
                </div>
              </div>
              <div className="table_cell_admin position_cell_admin">
                {t.track.User.UploaderName}
              </div>
              <div className="table_cell_admin country_cell_admin">
                {formatDate(t.metadata?.release_date)}
              </div>
              <div className="table_cell_admin status_cell_admin">
                <span className={`status_badge_admin ${statusClass}`}>
                  <span className="status_dot_admin" /> {statusText}
                </span>
              </div>
              <div className="table_cell_admin portfolio_cell_admin">
                <div className="portfolio_info_admin">
                  <div className="portfolio_percent_admin">
                    {t.listenCount}
                  </div>
                  {maxListen > 0 && (
                    <div className="progress_bar_container_admin">
                      <div
                        className="progress_bar_admin"
                        style={{
                          width: `${(t.listenCount / maxListen) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="table_cell_admin action_cell_admin">
                <button
                  className="edit_button_admin"
                  disabled={!checkedRows[t.track.id]}
                >
                  Edit
                </button>
                <button
                  className="delete_row_button_admin"
                  disabled={!checkedRows[t.track.id]}
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
