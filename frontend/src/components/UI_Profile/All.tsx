import React, { useState, useEffect } from "react";
// Import hàm khởi tạo WaveSurfer và các kiểu dữ liệu/API cần thiết
import { initWaveSurfer } from "../../hooks/WaveForm"; // Đảm bảo đường dẫn đúng
import { Song } from "../../hooks/GlobalAudioManager"; // Import kiểu Song
// --- THAY ĐỔI API IMPORT ---
// Import API để lấy bài hát của user và kiểu TrackData
// Giả sử bạn có hàm getMyUploadedTracksAPI trong trackServiceAPI.ts
import { getMyUploadedTracksAPI, TrackData,deleteTrackAPI } from "../../services/trackServiceAPI"; 
import SongOptionOfUser from "./SongOptionOfUser";
// --------------------------

// Hàm map từ TrackData sang Song (giữ nguyên)
const mapTrackDataToSong = (track: TrackData): Song => ({
    id: track.id, 
    src: track.src || '', 
    title: track.title === null ? undefined : track.title, 
    artist: track.artist === null ? undefined : track.artist, 
    cover: track.cover || "assets/anhmau.png", 
});

const SongList: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu bài hát của user khi component mount
  useEffect(() => {
    const fetchMyTracks = async () => { // Đổi tên hàm fetch
      setIsLoading(true);
      setError(null);
      try {
        // --- THAY ĐỔI API CALL ---
        // Gọi API để lấy các bài hát user đã upload
        const fetchedTracksData: TrackData[] = await getMyUploadedTracksAPI(); 
        // --------------------------
        
        const fetchedSongs: Song[] = fetchedTracksData.map(mapTrackDataToSong);
        setSongs(fetchedSongs); 
        console.log("[SongList] Fetched and mapped user's uploaded songs:", fetchedSongs);
      } catch (err: any) {
        console.error("[SongList] Failed to fetch user's uploaded tracks:", err);
        // Có thể hiển thị lỗi cụ thể hơn nếu API trả về (ví dụ: lỗi xác thực)
        if (err.message && err.message.includes('Unauthorized')) {
             setError("Bạn cần đăng nhập để xem bài hát đã tải lên.");
        } else {
             setError(err.message || "Không thể tải danh sách bài hát của bạn.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTracks(); // Gọi hàm fetch mới
  }, []); 

  // useEffect để khởi tạo WaveSurfer (giữ nguyên)
  useEffect(() => {
    if (!isLoading && !error && songs.length > 0) {
      console.log("[SongList] Data loaded, initializing WaveSurfer for user's songs...");
      const timer = setTimeout(() => {
        initWaveSurfer(); 
      }, 100); 
      return () => clearTimeout(timer);
    } else if (!isLoading && !error && songs.length === 0) {
        console.log("[SongList] No user uploaded songs to initialize WaveSurfer for.");
    }
  }, [isLoading, error, songs]); 

  const handleDeleteTrack = async (songId: number) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xoá bài nhạc này không?");
    if (!confirmDelete) return;
  
    const result = await deleteTrackAPI(songId);
    if (!result.success) {
      alert(`❌ Xóa thất bại: ${result.message}`);
      return;
    }
  
    // ✅ Xoá thành công, cập nhật UI
    setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
    alert("✅ Bài hát đã được xoá thành công!");
  };
  
  
  return (
    // Đảm bảo class "content all active" được áp dụng đúng cách
    <div className="content all active"> 
      {isLoading && <p>Đang tải danh sách bài hát của bạn...</p>}
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
      
      {!isLoading && !error && songs.length === 0 && (
          <p>Bạn chưa tải lên bài hát nào.</p> // Thông báo phù hợp hơn
      )}

      {/* Render danh sách bài hát từ state 'songs' (giữ nguyên) */}
      {!isLoading && !error && songs.length > 0 && (
        songs.map((song) => (
          <div
            key={song.id} 
            className="song"
            data-id={song.id} 
            data-src={song.src}
            data-title={song.title || ''} 
            data-artist={song.artist || ''} 
            data-cover={song.cover || ''} 
          >
            <div className="song_left">
              <img src={song.cover || 'assets/anhmau.png'} alt="Album Cover" className="album_cover" />
              <button className="play_button">
                <img src="assets/play.png" alt="Play" /> 
              </button>
            </div>
            <div className="song_info">
              <p className="song_title">{song.title || 'Unknown Title'}</p>
              <p className="artist">{song.artist || 'Unknown Artist'}</p>
              <div className="audio"></div> 
              <SongOptionOfUser
                onEdit={() => console.log("Edit", song.id)}
                onDelete={() => handleDeleteTrack(Number(song.id))}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SongList;
