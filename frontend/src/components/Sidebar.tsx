// components/Sidebar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Section.css"; // đổi sang Sidebar.css
import stackIcon from "../assets/images/stack.png";
import musicNoteIcon from "../assets/images/notnhac.png";
import { addPlaylist } from "../components/Manager_Playlists/ManagerDataPlaylist";
import { mockPlaylists, mockArtists } from "../services/mockSidebar";

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onExpandChange }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"playlists" | "artists">("playlists");

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    onExpandChange?.(next);
  };

  const handleCreate = () => {
    const newPl = addPlaylist();
    navigate(`/ManagerPlaylistLayout/${newPl.id}`);
    setActiveTab("playlists");
  };

  return (
    <aside className={`sidebar${expanded ? " expanded" : ""}`}>
      {/* Toggle và các nút cố định */}
      <button className="btn-YL" onClick={handleToggle}>
        <div className="btn-icon">
          <img src={stackIcon} alt="Library" />
        </div>
        {expanded && <span className="btn-label">Your Library</span>}
      </button>

      <button className="btn-NN">
        <div className="btn-icon">
          <img src={musicNoteIcon} alt="Music" />
        </div>
        {expanded && <span className="btn-label">Music</span>}
      </button>

      <button className="btn-CrePlaylist" onClick={handleCreate}>
        <div className="btn-icon">
          <svg viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/>
          </svg>
        </div>
        {expanded && <span className="btn-label">Create Playlist</span>}
      </button>

      {/* Tabs chỉ hiển thị khi expanded */}
      {expanded && (
        <div className="sidebar-tabs">
          <button
            className={activeTab === "playlists" ? "active" : ""}
            onClick={() => setActiveTab("playlists")}
          >
            Playlists
          </button>
          <button
            className={activeTab === "artists" ? "active" : ""}
            onClick={() => setActiveTab("artists")}
          >
            Artists
          </button>
        </div>
      )}

      {/* Danh sách luôn render */}
      <ul className="sidebar-list">
        {activeTab === "playlists" &&
          mockPlaylists.map((pl) => (
            <li
              key={pl.id}
              className="sidebar-item"
              onClick={() => navigate(`/playlist/${pl.id}`)}
            >
              <img
                src={pl.coverUrl}
                alt={pl.title}
                className="playlist-cover"
              />
              <div className="item-texts">
                <p className="item-title">{pl.title}</p>
                <p className="item-sub">{pl.ownerName}</p>
              </div>
            </li>
          ))}

        {activeTab === "artists" &&
          mockArtists.map((ar) => (
            <li
              key={ar.id}
              className="sidebar-item"
              onClick={() => navigate(`/profile`)}
            >
              <img
                src={ar.imageUrl}
                alt={ar.name}
                className="artist-avatar"
              />
              <div className="item-texts">
                <p className="item-title">{ar.name}</p>
                <p className="item-sub">Artist</p>
              </div>
            </li>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
