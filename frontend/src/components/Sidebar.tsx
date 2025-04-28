import  { useState } from "react"; // Thêm useContext nếu dùng Context để lấy userId
import { useNavigate } from "react-router-dom";
import "../styles/Section.css";
import stackIcon from '../assets/images/stack.png';
import musicNoteIcon from '../assets/images/notnhac.png';
// 1. Import hàm API mới thay vì hàm cũ
import { createPlaylistAPI } from "../services/playlistService"; // <-- Đường dẫn tới file service của bạn
// Giả sử bạn có AuthContext để lấy userId
// import { AuthContext } from '../../context/AuthContext'; // <-- Ví dụ Context

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

const Sidebar = ({ onExpandChange }: SidebarProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  // Ví dụ lấy userId từ Context (Bạn cần điều chỉnh theo cách bạn quản lý state đăng nhập)
  // const { userId } = useContext(AuthContext); // Bỏ comment và sửa nếu dùng Context

  // ---- Placeholder: Lấy userId ----
  // !!! QUAN TRỌNG: Bạn cần thay thế dòng này bằng cách lấy userId thực tế !!!
  const getCurrentUserId = (): string | number | null => {
     // Ví dụ: return localStorage.getItem('userId');
     // Ví dụ: return authState.user.id; // Nếu dùng Redux/Zustand
     // Tạm thời trả về một giá trị giả định để code chạy được, nhưng bạn PHẢI sửa lại
     console.warn("Sidebar: Cần lấy userId thực tế!");
     return 1; // <-- THAY THẾ BẰNG LOGIC LẤY userId THỰC TẾ
  };
  // ---------------------------------

  const handleToggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  };

  // 2. Biến thành hàm async và gọi API
  const handleCreatePlaylist = async () => {
    const userId = getCurrentUserId(); // Lấy userId

    // Kiểm tra xem có userId không
    if (!userId) {
       console.error("Không thể tạo playlist: Người dùng chưa đăng nhập.");
       // Có thể hiển thị thông báo cho người dùng ở đây
       return;
    }

    console.log("Bắt đầu tạo playlist cho user:", userId);
    // Có thể thêm trạng thái loading ở đây nếu muốn
    try {
       // Gọi API để tạo playlist mới (không cần trackId)
       const newPlaylist = await createPlaylistAPI(userId); // Bỏ tham số thứ 2 (trackId)

       if (newPlaylist && newPlaylist.id) {
         console.log("Playlist mới đã được tạo:", newPlaylist);
         // Điều hướng đến trang của playlist mới tạo thành công
         navigate(`/ManagerPlaylistLayout/${newPlaylist.id}`);
       } else {
         // Xử lý trường hợp API không trả về playlist hợp lệ (dù không báo lỗi)
         console.error("Không thể tạo playlist: API không trả về dữ liệu hợp lệ.");
         // Hiển thị thông báo lỗi cho người dùng
       }
    } catch (error) {
       console.error("Lỗi khi tạo playlist:", error);
       // Hiển thị thông báo lỗi cho người dùng (ví dụ: dùng thư viện react-toastify)
       alert("Đã xảy ra lỗi khi tạo playlist. Vui lòng thử lại.");
    } finally {
       // Tắt trạng thái loading nếu có
    }
  };

  return (
    <aside className={`sidebar ${expanded ? "expanded" : ""}`}>
      {/* Các nút khác giữ nguyên */}
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

      {/* Nút tạo playlist gọi hàm handleCreatePlaylist đã sửa */}
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