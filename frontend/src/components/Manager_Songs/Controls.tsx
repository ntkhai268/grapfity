import React, { useState, useEffect, useCallback, RefObject } from "react";

// Import API và kiểu dữ liệu Playlist từ service của bạn
import { getMyPlaylistsAPI } from "../../services/playlistService";
import { addTrackToPlaylistAPI } from "../../services/trackPlaylistService";
import type { PlaylistData } from "../Manager_Playlists/ManagerDataPlaylist";

// Định nghĩa kiểu dữ liệu cho props mà Controls sẽ nhận từ ManagerSongSection
interface ControlsProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  songUrl: string | undefined;
  isPlaying: boolean;
  togglePlay: () => void;
  currentTrackId?: string | number | null;
  // Thêm các props khác nếu ManagerSongSection truyền xuống (ví dụ: playNext, playPrevious, etc.)
}

// --- Component Controls ---
// Controls giờ đây nhận props từ ManagerSongSection
const Controls: React.FC<ControlsProps> = ({
  audioRef,
  songUrl,
  isPlaying,
  togglePlay,
  currentTrackId,
  // ...destructure các props khác nếu có
}) => {
  // --- Hooks & State ---

  // Giả định có cách lấy trạng thái đăng nhập
  const isLoggedIn = true; // <<< !!! THAY THẾ BẰNG LOGIC LẤY TRẠNG THÁI ĐĂNG NHẬP THỰC TẾ !!!



  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [userPlaylists, setUserPlaylists] = useState<PlaylistData[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [isAddingTrack, setIsAddingTrack] = useState<boolean>(false);

  // --- Handlers (Memoized with useCallback) ---

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const fetchPlaylists = useCallback(async () => {
    if (!isLoggedIn) {
      setUserPlaylists([]);
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
  }, [isLoggedIn]);

  const handleCreateNewPlaylist = useCallback(() => {
    console.log("Action: Create new playlist");
    closeDropdown();
  }, [closeDropdown]);

  const handleAddToExistingPlaylist = useCallback(async (playlistId: string | number) => {
    if (isAddingTrack || !currentTrackId) {
      if(!currentTrackId) console.error("Cannot add: Current Track ID missing (from props).");
      return;
    }
    console.log(`Action: Add track ${currentTrackId} to playlist ${playlistId}`);
    setIsAddingTrack(true);
    try {
      const result = await addTrackToPlaylistAPI(playlistId, currentTrackId);
      if (result.success) {
        alert(result.message || "Đã thêm bài hát vào playlist!");
      } else {
        alert(result.message || "Thêm bài hát thất bại.");
      }
    } catch (error) {
      console.error("Unexpected error calling addTrackToPlaylistAPI:", error);
      alert("Đã xảy ra lỗi không mong muốn.");
    } finally {
      setIsAddingTrack(false);
      closeDropdown();
    }
  }, [currentTrackId, closeDropdown, isAddingTrack]); // currentTrackId giờ là prop

  // --- Effects ---
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // --- Render ---
  return (
    <div className="controls">
      {/* Audio Player sử dụng audioRef và songUrl từ props */}
      <audio ref={audioRef} src={songUrl} />

      {/* Play/Pause Button sử dụng isPlaying và togglePlay từ props */}
      <div className="play-button" onClick={togglePlay}>
        <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} style={{ color: "black" }}></i>
      </div>

      {/* Other Icons */}
      <div className="control-icon">
        <i className="far fa-heart" style={{ color: "white" }}></i>
      </div>
      <div className="control-icon">
        <i className="fas fa-arrow-down" style={{ color: "white" }}></i>
      </div>

      {/* Ellipsis Icon & Main Dropdown Trigger */}
      <div className="control-icon" style={{ position: 'relative' }} onClick={toggleDropdown}>
        <i className="fas fa-ellipsis-h" style={{ color: "white" }}></i>
        <div className={`dropdown ${isDropdownOpen ? 'active' : ''}`}>
          <div className="dropdown-content">
            <a href="#">Like</a>
            {isLoggedIn ? (
              <div className="dropdown-item has-submenu">
                <span>Add To Playlist</span>
                <i className="fas fa-chevron-right submenu-arrow"></i>
                <div className="submenu">
                  <div className="submenu-item search-item">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm một danh sách phát" disabled={isLoadingPlaylists || !!playlistError}/>
                  </div>
                  <div className="submenu-item" onClick={handleCreateNewPlaylist}>
                    <i className="fas fa-plus"></i>
                    <span>Danh sách phát mới</span>
                  </div>
                  {isLoadingPlaylists && <div className="submenu-item">Đang tải...</div>}
                  {playlistError && <div className="submenu-item" style={{ color: 'red' }}>{playlistError}</div>}
                  {!isLoadingPlaylists && !playlistError && userPlaylists.length > 0 && (
                    userPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className={`submenu-item existing-playlist ${isAddingTrack ? 'disabled' : ''}`}
                        onClick={() => !isAddingTrack && handleAddToExistingPlaylist(playlist.id)}
                      >
                        <span>{playlist.title}</span>
                      </div>
                    ))
                  )}
                  {!isLoadingPlaylists && !playlistError && userPlaylists.length === 0 && (
                      <div className="submenu-item" style={{ fontStyle: 'italic', color: '#aaa' }}>Không có playlist.</div>
                  )}
                </div>
              </div>
            ) : (
              <a href="#" style={{ color: '#888', cursor: 'not-allowed' }} onClick={(e) => {e.preventDefault(); }}>
                Add To Playlist
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
