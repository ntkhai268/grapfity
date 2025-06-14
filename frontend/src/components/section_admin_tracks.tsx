import React, { useState, useEffect, useRef } from "react";
import { fetchJoinedTracks, JoinedTrack } from "../services/trackService";
import "../styles/admin.css";

// Load ảnh
const imageModules = import.meta.glob("../assets/images/*.{png,jpg,jpeg,svg}", {
  eager: true,
  as: "url",
});
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split("/").pop();
  if (filename) imageMap[filename] = url as string;
});

const Section_admin_tracks: React.FC = () => {
  const [tracks, setTracks] = useState<JoinedTrack[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const loadTracks = async () => {
    try {
      const data = await fetchJoinedTracks();
      setTracks(data);
    } catch (err) {
      console.error("Lỗi khi fetch tracks:", err);
    }
  };

  useEffect(() => {
    loadTracks();
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
    iso ? new Date(iso).toLocaleDateString("vi-VN") : "N/A";

  const displayedTracks = tracks
    .filter((t) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      const name = (t.Metadatum?.trackname || `Track ${t.id}`).toLowerCase();
      const artist = t.User?.UploaderName?.toLowerCase() || "";
      return name.includes(term) || artist.includes(term);
    });

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
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="users_table_admin">
        <div className="table_header_admin">
          <div className="table_cell_admin name_cell_admin">Tracks</div>
          <div className="table_cell_admin position_cell_admin">Artist</div>
          <div className="table_cell_admin country_cell_admin">Posting date</div>
        </div>

        {displayedTracks.map((t) => {
          const title = t.Metadatum?.trackname || `Track ${t.id}`;
          const fileName = t.imageUrl.split("/").pop()!;
          const imgSrc = imageMap[fileName] || t.imageUrl;
          const artist = t.User?.UploaderName || "N/A";
          const day = formatDate(t.createdAt);

          return (
            <div className="table_row_admin" key={t.id}>
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
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Section_admin_tracks;
