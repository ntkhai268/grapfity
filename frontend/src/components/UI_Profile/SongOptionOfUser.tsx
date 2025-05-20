import React, { useState, useRef, useEffect } from 'react';
import { getMyPlaylistsAPI,createPlaylistAPI } from "../../services/playlistService";
import { addTrackToPlaylistAPI } from "../../services/trackPlaylistService";
import type { PlaylistData } from "../Manager_Playlists/ManagerDataPlaylist";
// import './SongOptionOfUser.css'; 

interface SongOptionOfUserProps {
  onEdit: () => void;
  onDelete: () => void;
  trackId : number;
  isOwner: boolean;
}

const SongOptionOfUser: React.FC<SongOptionOfUserProps> = ({ onEdit, onDelete, trackId, isOwner }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (open && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownHeight = 220; // chiều cao dự kiến của menu
      const screenBottom = window.innerHeight;

      if (rect.bottom + dropdownHeight > screenBottom) {
        setDropUp(true);  // hiển thị lên
      } else {
        setDropUp(false); // hiển thị xuống
      }
    }
  }, [open]);
  const fetchPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyPlaylistsAPI();
      setPlaylists(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải playlist.");
    } finally {
      setIsLoading(false);
    }
  };
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
                await fetchPlaylists(); 
                // Điều hướng đến trang của playlist mới tạo thành công
       
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
  const handleAddToExistingPlaylist = async (playlistId: string | number) => {
  if (isAddingTrack || !trackId) {
    if (!trackId) console.error("Không có trackId để thêm vào playlist.");
    return;
  }

  console.log(`Add track ${trackId} to playlist ${playlistId}`);
  setIsAddingTrack(true);
  try {
    const result = await addTrackToPlaylistAPI(playlistId, trackId);
    if (result.success) {
      alert(result.message || "Đã thêm bài hát vào playlist!");
    } else {
      alert(result.message || "Thêm bài hát thất bại.");
    }
  } catch (error) {
    console.error("Lỗi khi gọi API thêm track vào playlist:", error);
    alert("Đã xảy ra lỗi.");
  } finally {
    setIsAddingTrack(false);
    setIsSubmenuOpen(false); // hoặc closeDropdown nếu bạn có
  }
};



  return (
    <div className="more_options_container" ref={dropdownRef}>
      <div className="more_options_icon" onClick={() => setOpen(!open)}><i className="fas fa-ellipsis-h" style={{ color: "white" }}></i></div>
      {open && (
        <div className={`dropdown_menu_all ${dropUp ? 'drop-up' : ''}`}>
          <div className="dropdown_item_all has-submenu"
            onMouseEnter={() => {
              setIsSubmenuOpen(true);
              fetchPlaylists();
            }}
            onMouseLeave={() => setIsSubmenuOpen(false)}
          >
            <span >Add To Playlist </span>
            
            <i className="fas fa-chevron-right submenu-arrow"></i>
            {isSubmenuOpen && (
              <div className="submenu_all">
                <div className="submenu_item_all" onClick={handleCreatePlaylist}>
                  <i className="fas fa-plus"></i>
                  <span>  Create new playlist</span>
                </div>
                {isLoading && (
                  <div className="submenu_item_all">Loading...</div>
                )}

                {error && (
                  <div className="submenu_item_all" style={{ color: "red" }}>{error}</div>
                )}

                {!isLoading && !error && playlists.length === 0 && (
                  <div className="submenu_item_all" style={{ fontStyle: "italic", color: "#aaa" }}>Chưa có playlist</div>
                )}

                {!isLoading && !error && playlists.map((playlist) => (
                  <div key={playlist.id} className="submenu_item_all"  onClick={() => handleAddToExistingPlaylist(playlist.id)}>
                    {playlist.title}
                  </div>
                ))}
                
              </div>
            )}
          </div>
          {isOwner && (
            <>
              <div className="dropdown_item_all" onClick={onEdit}>Edit</div>
              <div className="dropdown_item_all" onClick={onDelete}>Delete</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SongOptionOfUser;
