import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Section.css";
import stackIcon from '../assets/images/stack.png';
import musicNoteIcon from '../assets/images/notnhac.png';
import { addPlaylist } from "../components/Manager_Playlists/ManagerDataPlaylist";

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

const Sidebar = ({ onExpandChange }: SidebarProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  };

  const handleCreatePlaylist = () => {
    const newPlaylist = addPlaylist();
    navigate(`/ManagerPlaylistLayout/${newPlaylist.id}`);
  };

  return (
    <aside className={`sidebar ${expanded ? "expanded" : ""}`}>
      <button className="btn-YL" onClick={handleToggleExpand}>
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

      <button className="btn-CrePlaylist" onClick={handleCreatePlaylist}>
        <div className="btn-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17">
            <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" />
          </svg>
        </div>
        {expanded && <span className="btn-label">Create Playlist</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
