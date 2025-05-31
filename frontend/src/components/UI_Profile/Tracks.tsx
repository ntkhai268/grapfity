import React, { useState, useEffect } from "react";
// Import hàm khởi tạo WaveSurfer và các kiểu dữ liệu/API cần thiết
import { initWaveSurfer } from "../../hooks/WaveForm"; // Đảm bảo đường dẫn đúng
import { Song } from "../../hooks/GlobalAudioManager"; // Import kiểu Song
// --- THAY ĐỔI API IMPORT ---
// Import API để lấy bài hát của user và kiểu TrackData
// Giả sử bạn có hàm getMyUploadedTracksAPI trong trackServiceAPI.ts
import { getMyUploadedTracksAPI, TrackData,deleteTrackAPI,getPublicTracksOfUserAPI  } from "../../services/trackServiceAPI"; 
import SongOptionOfUser from "./SongOptionOfUser";
import UpdateSongBasicInfo from "../Manager_Songs/updateSongBasicInfo";


// --------------------------
interface SongProps {
  viewedUserId: string | number;
  currentUserId: string | number;
}
// Hàm map từ TrackData sang Song (giữ nguyên)
const mapTrackDataToSong = (track: TrackData): Song => ({
    id: track.id, 
    src: track.src || '', 
    title: track.title === null ? undefined : track.title, 
    artist: track.artist === null ? undefined : track.artist, 
    cover: track.cover || "/assets/anhmau.png", 
});

const Tracks: React.FC<SongProps> = ({ viewedUserId, currentUserId }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  

  // Fetch dữ liệu bài hát của user khi component mount
  useEffect(() => {
  const fetchTracks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let fetchedTracksData: TrackData[] = [];

      if (viewedUserId === "me" || viewedUserId === currentUserId) {
        fetchedTracksData = await getMyUploadedTracksAPI(); 
        console.log("🧪 My track list:", fetchedTracksData);
      } else {
        fetchedTracksData = await getPublicTracksOfUserAPI(viewedUserId);
        console.log("🧪 Public track list:", fetchedTracksData);
      }

      const fetchedSongs: Song[] = fetchedTracksData.map(mapTrackDataToSong);
      setSongs(fetchedSongs);
      console.log("[Song] Fetched tracks:", fetchedSongs);
    } catch (err: any) {
      console.error("[Song] Error fetching tracks:", err);
      setError("Không thể tải danh sách bài hát.");
    } finally {
      setIsLoading(false);
    }
  };

  fetchTracks();
}, [viewedUserId, currentUserId]);


  // useEffect để khởi tạo WaveSurfer (giữ nguyên)
  useEffect(() => {
    if (!isLoading && !error && songs.length > 0) {
      console.log("[Track] Data loaded, initializing WaveSurfer for user's songs...");
      const timer = setTimeout(() => {
        initWaveSurfer(); 
      }, 100); 
      return () => clearTimeout(timer);
    } else if (!isLoading && !error && songs.length === 0) {
        console.log("[Track] No user uploaded songs to initialize WaveSurfer for.");
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
    <div className="content track"> 
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
              <img src={song.cover || '/assets/anhmau.png'} alt="Album Cover" className="album_cover" />
              <button className="play_button">
                <img src="/assets/play.png" alt="Play" /> 
              </button>
            </div>
            <div className="song_info">
              <p className="song_title">{song.title || 'Unknown Title'}</p>
              <p className="artist">{song.artist || 'Unknown Artist'}</p>
              <div className="audio"></div> 
              <SongOptionOfUser
                onEdit={() => setEditingSongId(Number(song.id))} // nút chỉnh sửa nhạc ở đây
                onDelete={() => handleDeleteTrack(Number(song.id))}
                trackId={Number(song.id)}
                 isOwner={viewedUserId === "me" || viewedUserId === currentUserId}
              />
            </div>
             {editingSongId === Number(song.id) && (
              <UpdateSongBasicInfo
                trackId={song.id}
                onCancel={() => setEditingSongId(null)}
                onSaveSuccess={async () => {
                  // ví dụ reload danh sách track, hoặc đóng modal
                  console.log("Đã cập nhật thành công");
                  setEditingSongId(null);
                  try {
                    const updatedTracks = await getMyUploadedTracksAPI();
                    const mappedSongs = updatedTracks.map(mapTrackDataToSong);
                    setSongs(mappedSongs);
                  } catch (err) {
                    console.error("Lỗi khi reload danh sách bài hát:", err);
                  }
                }}            
               />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Tracks;
