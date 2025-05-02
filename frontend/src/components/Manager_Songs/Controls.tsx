import React, { useState, useEffect, useCallback } from "react";
import useSongManager from "../../hooks/Manager_Song_Play"; // Hook quản lý nhạc

// Import API và kiểu dữ liệu Playlist từ service của bạn
// *** Đảm bảo đường dẫn import đúng và PlaylistData đã được export ***
import { getMyPlaylistsAPI } from "../../services/playlistService";
import {addTrackToPlaylistAPI} from "../../services/trackServiceAPI";
// Giả sử PlaylistData được export từ đây theo yêu cầu trước đó
import type { PlaylistData } from "../Manager_Playlists/ManagerDataPlaylist";
// Hoặc nếu nó thực sự ở ManagerDataPlaylist:
// import type { PlaylistData } from "../Manager_Playlists/ManagerDataPlaylist";


// Định nghĩa kiểu dữ liệu trả về của hook useSongManager
interface ISongManagerOutput {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  songUrl: string | undefined;
  isPlaying: boolean;
  togglePlay: () => void;
  // Quan trọng: Hook cần cung cấp thông tin bài hát hiện tại
  currentTrackId?: string | number | null;
}

// --- Component Controls ---
const Controls: React.FC = () => {
  // --- Hooks & State ---

  // Giả định có cách lấy trạng thái đăng nhập (ví dụ: từ Context, Redux,...)
  const isLoggedIn = true; // <<< !!! THAY THẾ BẰNG LOGIC LẤY TRẠNG THÁI ĐĂNG NHẬP THỰC TẾ !!!

  const {
    audioRef,
    songUrl,
    isPlaying,
    togglePlay,
    currentTrackId, // Lấy ID bài hát hiện tại từ hook
  }: ISongManagerOutput = useSongManager();

  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [userPlaylists, setUserPlaylists] = useState<PlaylistData[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  // (Optional) State for API call in progress (prevents double clicks)
  const [isAddingTrack, setIsAddingTrack] = useState<boolean>(false);

  // --- Handlers (Memoized with useCallback) ---

  // Đóng/Mở dropdown chính
  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []); // Không cần fetch ở đây nữa nếu fetch trong useEffect

  // Đóng dropdown
  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Fetch danh sách playlist (chỉ khi đã đăng nhập)
  const fetchPlaylists = useCallback(async () => {
    if (!isLoggedIn) {
      setUserPlaylists([]); // Reset playlist nếu không đăng nhập
      return;
    }
    setIsLoadingPlaylists(true);
    setPlaylistError(null);
    try {
      const playlists = await getMyPlaylistsAPI();
      setUserPlaylists(playlists);
    } catch (error: any) {
      console.error("Failed to fetch user playlists:", error);
      setPlaylistError("Không thể tải danh sách playlist.");
    } finally {
      setIsLoadingPlaylists(false);
    }
  }, [isLoggedIn]); // Phụ thuộc vào trạng thái đăng nhập

  // Xử lý tạo playlist mới
  const handleCreateNewPlaylist = useCallback(() => {
    console.log("Action: Create new playlist");
    // TODO: Implement logic (mở modal, gọi API)
    closeDropdown();
  }, [closeDropdown]);

  // Xử lý thêm vào playlist đã có
  const handleAddToExistingPlaylist = useCallback(async (playlistId: string | number) => {
    // Ngăn chặn click nếu đang xử lý hoặc chưa có track ID
    if (isAddingTrack || !currentTrackId) {
        if(!currentTrackId) console.error("Cannot add: Current Track ID missing.");
        return;
    }

    console.log(`Action: Add track ${currentTrackId} to playlist ${playlistId}`);
    setIsAddingTrack(true); // Bắt đầu xử lý

    try {
      const result = await addTrackToPlaylistAPI(playlistId, currentTrackId);
      if (result.success) {
        alert(result.message || "Đã thêm bài hát vào playlist!"); // Placeholder feedback
        // TODO: Dùng toast notification thay cho alert
      } else {
        alert(result.message || "Thêm bài hát thất bại."); // Placeholder feedback
        // TODO: Dùng toast notification
      }
    } catch (error) {
      console.error("Unexpected error calling addTrackToPlaylistAPI:", error);
      alert("Đã xảy ra lỗi không mong muốn."); // Placeholder feedback
      // TODO: Dùng toast notification
    } finally {
      setIsAddingTrack(false); // Kết thúc xử lý
      closeDropdown(); // Đóng dropdown
    }
  }, [currentTrackId, closeDropdown, isAddingTrack]); // Phụ thuộc các giá trị này

  // --- Effects ---

  // Fetch playlist khi component mount hoặc khi trạng thái đăng nhập thay đổi
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]); // fetchPlaylists đã bao gồm isLoggedIn

  // (Optional) Effect để đóng dropdown khi click ra ngoài (vẫn là TODO)
  // ...

  // --- Render ---
  return (
    <div className="controls">
      {/* Audio Player */}
      <audio ref={audioRef} src={songUrl} />

      {/* Play/Pause Button */}
      <div className="play-button" onClick={togglePlay}>
        <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} style={{ color: "black" }}></i>
      </div>

      {/* Other Icons */}
      <div className="control-icon">
        <i className="far fa-heart" style={{ color: "white" }}></i> {/* TODO: Like action */}
      </div>
      <div className="control-icon">
        <i className="fas fa-arrow-down" style={{ color: "white" }}></i> {/* TODO: Download action */}
      </div>

      {/* Ellipsis Icon & Main Dropdown Trigger */}
      <div className="control-icon" style={{ position: 'relative' }} onClick={toggleDropdown}>
        <i className="fas fa-ellipsis-h" style={{ color: "white" }}></i>

        {/* Main Dropdown Container */}
        <div className={`dropdown ${isDropdownOpen ? 'active' : ''}`}>
          <div className="dropdown-content">
            {/* Like Action */}
            <a href="#">Like</a> {/* TODO: Implement Like Action */}

            {/* Add To Playlist Item (Conditional based on login) */}
            {isLoggedIn ? (
              <div className="dropdown-item has-submenu">
                <span>Add To Playlist</span>
                <i className="fas fa-chevron-right submenu-arrow"></i>

                {/* Submenu */}
                <div className="submenu">
                  {/* Search */}
                  <div className="submenu-item search-item">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm một danh sách phát" disabled={isLoadingPlaylists || !!playlistError}/> {/* TODO: Implement Search */}
                  </div>
                  {/* Create New */}
                  <div className="submenu-item" onClick={handleCreateNewPlaylist}>
                    <i className="fas fa-plus"></i>
                    <span>Danh sách phát mới</span>
                  </div>

                  {/* Dynamic Playlist List */}
                  {isLoadingPlaylists && <div className="submenu-item">Đang tải...</div>}
                  {playlistError && <div className="submenu-item" style={{ color: 'red' }}>{playlistError}</div>}
                  {!isLoadingPlaylists && !playlistError && userPlaylists.length > 0 && (
                    userPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className={`submenu-item existing-playlist ${isAddingTrack ? 'disabled' : ''}`} // Disable if adding
                        onClick={() => !isAddingTrack && handleAddToExistingPlaylist(playlist.id)} // Prevent click if adding
                      >
                        <span>{playlist.title}</span>
                        {/* Có thể thêm spinner nhỏ ở đây nếu isAddingTrack và ID đang xử lý trùng khớp */}
                      </div>
                    ))
                  )}
                  {!isLoadingPlaylists && !playlistError && userPlaylists.length === 0 && (
                      <div className="submenu-item" style={{ fontStyle: 'italic', color: '#aaa' }}>Không có playlist.</div>
                  )}
                  {/* End Dynamic Playlist List */}
                </div> {/* End Submenu */}
              </div> /* End has-submenu */
            ) : (
              <a href="#" style={{ color: '#888', cursor: 'not-allowed' }} onClick={(e) => {e.preventDefault(); /* TODO: Show login prompt? */ }}>
                Add To Playlist
              </a>
            )}
            {/* End Add To Playlist Item */}

            
          </div>
        </div> {/* End Main Dropdown Container */}
      </div> {/* End Ellipsis Icon & Main Dropdown Trigger */}
    </div> /* End controls */
  );
};

export default Controls;