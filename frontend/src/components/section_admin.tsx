// src/components/Section_admin.tsx
import React, { useState, useEffect } from "react";
import { fetchJoinedTracks, JoinedTrack } from "../services/trackService";
import "../styles/admin.css";

// Load ảnh từ thư mục public
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
  const [tracks, setTracks] = useState<JoinedTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<JoinedTrack[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allChecked, setAllChecked] = useState(false);
  const [checkedRows, setCheckedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchJoinedTracks()
      .then((data) => {
        const approved = data.filter((t) => t.status === "approved");
        setTracks(approved);
        setFilteredTracks(approved);
        const init: Record<number, boolean> = {};
        approved.forEach((t) => (init[t.id] = false));
        setCheckedRows(init);
        setAllChecked(false);
      })
      .catch((err) => console.error("Lỗi khi fetch joined tracks:", err));
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

  const maxListen =
    tracks.length > 0
      ? Math.max(...tracks.map((t) => t.listeningHistories[0]?.listenCount || 0))
      : 0;

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
          const fileName = t.imageUrl.split("/").pop()!;
          const imgSrc = imageMap[fileName] || "";
          const statusClass =
            t.status === "approved"
              ? "status_active_admin"
              : t.status === "pending"
              ? "status_pending_admin"
              : "status_rejected_admin";
          const statusText = t.status.charAt(0).toUpperCase() + t.status.slice(1);
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
                  className="edit_button_admin"
                  disabled={!checkedRows[t.id]}
                >
                  Edit
                </button>
                <button
                  className="delete_row_button_admin"
                  disabled={!checkedRows[t.id]}
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
