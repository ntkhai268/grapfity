import { useState } from "react"; // Bỏ useContext nếu không dùng để lấy userId ở đây
import { useNavigate } from "react-router-dom";
import "../styles/Section.css";
import stackIcon from '../assets/images/stack.png';
import musicNoteIcon from '../assets/images/notnhac.png';
// 1. Import hàm API
import { createPlaylistAPI } from "../services/playlistService"; // <-- Đường dẫn tới file service của bạn
// Không cần import Context ở đây nữa nếu chỉ dùng cho việc tạo playlist

interface SidebarProps {
    onExpandChange?: (expanded: boolean) => void;
}

const Sidebar = ({ onExpandChange }: SidebarProps) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    // Không cần lấy userId ở đây nữa vì API không cần

    const handleToggleExpand = () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        onExpandChange?.(newExpanded);
    };

    // 2. Sửa lại hàm handleCreatePlaylist
    const handleCreatePlaylist = async () => {
        console.log("Bắt đầu tạo playlist mới...");
        // Có thể thêm trạng thái loading ở đây nếu muốn (ví dụ: disable nút)
        // setIsLoading(true);
        try {
            // Gọi API tạo playlist mới (KHÔNG cần truyền userId, chỉ truyền trackId nếu có)
            // Vì đây là tạo playlist trống, không cần truyền gì cả (hoặc truyền null/undefined)
            const newPlaylist = await createPlaylistAPI(); // <-- Gọi không cần tham số

            if (newPlaylist && newPlaylist.id) {
                console.log("Playlist mới đã được tạo:", newPlaylist);
                // Điều hướng đến trang của playlist mới tạo thành công
                navigate(`/ManagerPlaylistLayout/${newPlaylist.id}`);
            } else {
                console.error("Không thể tạo playlist: API không trả về dữ liệu hợp lệ.");
                alert("Đã xảy ra lỗi khi tạo playlist (phản hồi không hợp lệ).");
            }
        } catch (error: any) { // Bắt lỗi cụ thể hơn
            console.error("Lỗi khi tạo playlist:", error);
            // Kiểm tra lỗi Unauthorized
            if (error.message === 'Unauthorized') {
                 alert("Vui lòng đăng nhập để tạo playlist.");
                 // navigate('/login'); // Chuyển hướng nếu cần
            } else {
                 alert(`Đã xảy ra lỗi khi tạo playlist: ${error.message || 'Vui lòng thử lại.'}`);
            }
        } finally {
            // Tắt trạng thái loading nếu có
            // setIsLoading(false);
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
