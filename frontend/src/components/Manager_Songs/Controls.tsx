import React, { useState, useEffect, useCallback, RefObject } from "react";

// Import API và kiểu dữ liệu Playlist từ service của bạn
import { createPlaylistAPI, getMyPlaylistsAPI } from "../../services/playlistService";
import { addTrackToPlaylistAPI } from "../../services/trackPlaylistService";
import {downloadTrackByIdAPI } from"../../services/trackServiceAPI";
import type { PlaylistData } from "../Manager_Playlists/ManagerDataPlaylist";
import {  isTrackLikedByUserAPI,  likeTrackAPI,  unlikeTrackAPI,  countLikesForTrackAPI,} from "../../services/likeService";
import GlobalAudioManager from "../../hooks/GlobalAudioManager";

// Định nghĩa kiểu dữ liệu cho props mà Controls sẽ nhận từ ManagerSongSection
interface ControlsProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  songUrl: string | undefined;
  isPlaying: boolean;
  
  currentTrackId?: string | number | null;
  trackId?: string | number | null;
  // playlistIndex: number;
  // Thêm các props khác nếu ManagerSongSection truyền xuống (ví dụ: playNext, playPrevious, etc.)
}

// --- Component Controls ---
// Controls giờ đây nhận props từ ManagerSongSection
const Controls: React.FC<ControlsProps> = ({
  audioRef,
  songUrl,
  isPlaying,
  currentTrackId,
  trackId,
  // playlistIndex,
  // ...destructure các props khác nếu có
}) => {
  // --- Hooks & State ---
  // console.log('[DEBUG] Controls props:', {trackId, songUrl, currentTrackId, isPlaying});

  // Giả định có cách lấy trạng thái đăng nhập
  const isLoggedIn = true; // <<< !!! THAY THẾ BẰNG LOGIC LẤY TRẠNG THÁI ĐĂNG NHẬP THỰC TẾ !!!



  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [userPlaylists, setUserPlaylists] = useState<PlaylistData[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [isAddingTrack, setIsAddingTrack] = useState<boolean>(false);

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  // --- Handlers (Memoized with useCallback) ---

  const handleToggleLike = async () => {
    if (!trackId || !isLoggedIn) return;

    try {
      if (isLiked) {
        await unlikeTrackAPI(trackId);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await likeTrackAPI(trackId);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Lỗi khi toggle like:", error);
      alert("Có lỗi xảy ra khi like/unlike bài hát.");
    }
  };

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


// const handlePlayButtonClick = () => {
//   const currentSong = GlobalAudioManager.getCurrentSong();
//   const currentIsPlaying = GlobalAudioManager.getIsPlaying();
//   const audio = GlobalAudioManager.getAudioElement();

//   if (!trackId || !songUrl) {
//     console.error("Missing trackId or songUrl");
//     return;
//   }

//   const isCurrentSong = currentSong && currentSong.id === trackId;

//   if (!isCurrentSong) {
//     // 🔥 Chỉ phát bài đầu tiên đã được set từ ManagerSongSection
//     console.log("📀 Bài khác đang phát. Phát bài đã được setup trong ManagerSongSection.");
//     GlobalAudioManager.playSongAt(playlistIndex); // chỉ phát bài đã được set
//   } else {
//     if (currentIsPlaying) {
//       GlobalAudioManager.pausePlayback();
//     } else if (audio && currentSong) {
//       GlobalAudioManager.playAudio(audio, currentSong);
//     }
//   }
// };



  // --- Effects ---
  
  const handlePlayButtonClick = () => {
  const currentSong = GlobalAudioManager.getCurrentSong();
  const isCurrentlyPlaying = GlobalAudioManager.getIsPlaying();
  const audio = GlobalAudioManager.getAudioElement();

  if (!trackId || !songUrl) {
    console.error("Missing trackId or songUrl");
    return;
  }

  const isCurrentSong = currentSong && currentSong.id === trackId;

  if (!isCurrentSong) {
    // ✅ Lúc này mới load đúng playlist đã được xem
    const playlist = JSON.parse(localStorage.getItem("viewedPlaylist") || "[]");
    const index = parseInt(localStorage.getItem("viewedIndex") || "0");

    const context = {
      id: `manager-${trackId}`,
      type: "queue"
    };

    GlobalAudioManager.setPlaylist(playlist, index, context);
    setTimeout(() => {
      GlobalAudioManager.playSongAt(index);
    }, 50);
  } else {
    if (isCurrentlyPlaying) {
      GlobalAudioManager.pausePlayback();
    } else if (audio && currentSong) {
      GlobalAudioManager.playAudio(audio, currentSong);
    }
  }
};


  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

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
  //Tải trạng thái like & số like khi trackId thay đổi
  useEffect(() => {
    const fetchLikeState = async () => {
      if (!trackId || !isLoggedIn) return;

      try {
        const liked = await isTrackLikedByUserAPI(trackId);
        const count = await countLikesForTrackAPI(trackId);
        setIsLiked(liked);
        setLikeCount(count);
      } catch (error) {
        console.error("Không thể tải trạng thái like:", error);
      }
    };

    fetchLikeState();
  }, [trackId, isLoggedIn]);

  useEffect(() => {
  console.log('[DEBUG] Controls nhận props mới:', { trackId, songUrl, currentTrackId, isPlaying });
}, [trackId, songUrl, currentTrackId, isPlaying]);
  
// console.log("Controls xxxxxxxxxx:", { trackId, currentTrackId, isPlaying,  }); 
  // --- Render ---
  return (
    <div className="controls">
      {/* Audio Player sử dụng audioRef và songUrl từ props */}
      <audio ref={audioRef} src={songUrl} />

      {/* Play/Pause Button sử dụng isPlaying và togglePlay từ props */}
      <div className="play-button" onClick={handlePlayButtonClick}>
       <i
        className={
          isPlaying && currentTrackId === trackId
            ? "fas fa-pause"
            : "fas fa-play"
        }
        style={{ color: "black" }}
      ></i>
      </div>

      {/* Other Icons */}
      <div className="control-icon" onClick={handleToggleLike} title={isLiked ? "Bỏ thích" : "Thích"}>
        <i
          className={isLiked ? "fas fa-heart" : "far fa-heart"} // fas = solid (đỏ), far = regular (viền)
          style={{ color: isLiked ? "red" : "white", cursor: "pointer" }}
        ></i>
        <span style={{ fontSize: "12px", marginLeft: "4px", color: "#ccc" }}>{likeCount}</span>
      </div>

     <div
        className="control-icon"
        title="Tải bài hát về"
        onClick={() => trackId != null && downloadTrackByIdAPI(trackId)}
      >
        <i className="fas fa-arrow-down" style={{ color: "white", cursor: "pointer" }}></i>
      </div>

      {/* Ellipsis Icon & Main Dropdown Trigger */}
      <div className="control-icon" style={{ position: 'relative' }} onClick={toggleDropdown}>
        <i className="fas fa-ellipsis-h" style={{ color: "white" }}></i>
        <div className={`dropdown ${isDropdownOpen ? 'active' : ''}`}>
          <div className="dropdown-content">
           <a
              href="#"
              onClick={async (e) => {
                e.preventDefault(); // Ngăn chuyển trang
                await handleToggleLike(); // Gọi hàm đã viết sẵn
                closeDropdown(); // Đóng dropdown sau khi nhấn
              }}
              style={{ color: isLiked ? 'red' : 'white' }}
            >
              {isLiked ? 'Unlike' : 'Like'}
            </a>
            {isLoggedIn ? (
              <div className="dropdown-item has-submenu">
                <span>Add To Playlist</span>
                <i className="fas fa-chevron-right submenu-arrow"></i>
                <div className="submenu">
                  <div className="submenu-item search-item">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm một danh sách phát" disabled={isLoadingPlaylists || !!playlistError}/>
                  </div>
                  <div className="submenu-item" onClick={handleCreatePlaylist}>
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