import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import stackIcon from '../assets/images/stack.png';
import musicNoteIcon from '../assets/images/notnhac.png';

// ✅ Import hàm tạo playlist mới
import { addPlaylist } from "../components/Manager_Playlists/ManagerDataPlaylist";

const Sidebar = () => {
  const navigate = useNavigate();

  // ✅ Xử lý khi nhấn nút tạo playlist
  const handleCreatePlaylist = () => {
    const newPlaylist = addPlaylist(); // Tạo playlist mới
    navigate(`/ManagerPlaylistLayout/${newPlaylist.id}`); // Chuyển đến trang của nó
  };

  return (
    <aside className="sidebar">
      <button className="btn-YL">
        <img src={stackIcon} alt="Library" />
      </button>

      <button className="btn-NN">
        <img src={musicNoteIcon} alt="Music" />
      </button>

      <button className="btn-CrePlaylist" onClick={handleCreatePlaylist}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill="white"
          viewBox="0 0 17 17"
        >
          <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" />
        </svg>
      </button>
    </aside>
  );
};

export default Sidebar;
