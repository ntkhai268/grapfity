import React, { useState, useEffect, useRef } from "react";
// Import hàm khởi tạo WaveSurfer và các kiểu dữ liệu/API cần thiết
import { initWaveSurfer } from "../../hooks/WaveForm"; // Đảm bảo đường dẫn đúng
import { Song } from "../../hooks/GlobalAudioManager"; // Import kiểu Song
// --- THAY ĐỔI API IMPORT ---
// Import API để lấy bài hát của user và kiểu TrackData
// Giả sử bạn có hàm getMyUploadedTracksAPI trong trackServiceAPI.ts
import { getMyUploadedTracksAPI, TrackData,deleteTrackAPI,getPublicTracksOfUserAPI  } from "../../services/trackServiceAPI"; 
import SongOptionOfUser from "./SongOptionOfUser";
import UpdateSongBasicInfo from "../Manager_Songs/updateSongBasicInfo";
import { getMyPlaylistsAPI, getPublicPlaylistsByUserIdAPI } from "../../services/playlistService";
import {PlaylistData} from "./Playlist"
import handlePlayTrack from "../../hooks/Manager_Playlist";



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

const SongList: React.FC<SongProps> = ({ viewedUserId, currentUserId }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<number | null>(null);

  // state cho playlist
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(true);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const playlistContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // fetch cho playlist khi mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoadingPlaylists(true);
      setPlaylistError(null);
      try {
        let fetchedPlaylists: PlaylistData[] = [];
        if (viewedUserId === "me" || viewedUserId === currentUserId) {
          fetchedPlaylists = await getMyPlaylistsAPI();
        } else {
          fetchedPlaylists = await getPublicPlaylistsByUserIdAPI(viewedUserId);
        }
        setPlaylists(fetchedPlaylists);
      } catch (err: any) {
        setPlaylistError("Không thể tải danh sách playlist.");
      } finally {
        setIsLoadingPlaylists(false);
      }
    };
    fetchPlaylists();
  }, [viewedUserId, currentUserId]);
  
  return (
    <div className="content all active">

    {/* All Playlists */}
    <h2 style={{ marginTop: 0, marginLeft: 10, color: "white" }}>Playlists</h2>
    {isLoadingPlaylists && <p>Đang tải playlist...</p>}
    {playlistError && <p style={{ color: 'red' }}>Lỗi: {playlistError}</p>}
    {!isLoadingPlaylists && !playlistError && playlists.length === 0 && (
      <p>Không có playlist nào.</p>
    )}
    {!isLoadingPlaylists && !playlistError && playlists.length > 0 && (
      <div className="all-playlists-list">
        {playlists.map((playlist, playlistIndex) => (
          <div
            className="player-container"
            key={playlist.id}
            ref={el => { playlistContainerRefs.current[playlistIndex] = el; }}
          >
            <div className="track-info">
              <div className="album-art">
                {playlist.cover ? (
                  <img
                    src={playlist.cover}
                    alt={playlist.title}
                    className="playlist-cover"
                    style={{ width: 160, height: 160, borderRadius: 8, objectFit: "cover" }}
                  />
                ) : (
                  <div className="playlist-cover default-icon-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="track-details">
                <div className="artist-info">
                  <span className="artist-name">{playlist.artist}</span>
                  {playlist.timeAgo && (
                    <span className="time-ago">{playlist.timeAgo}</span>
                  )}
                </div>
                <h2
                  className="track-title clickable"
                  onClick={() => window.location.href = `/ManagerPlaylistLayout/${playlist.id}`}
                  style={{ cursor: "pointer", color: "#1db954" }}
                  title={`Go to playlist: ${playlist.title}`}
                >
                  {playlist.title}
                </h2>
                <div className="waveform">
                  {/* Nếu muốn render waveform, thêm component hoặc div ở đây */}
                    <div className="audio-playlist"></div>
                </div>
                <div className="track-list">
                  {Array.isArray(playlist.tracks) && playlist.tracks.map((track, trackIndex) => (
                    <div
                      className="track-item-profile"
                      key={track.id || trackIndex}
                      title={`Play: ${track.title}`}
                      onClick={() => {
                         const containerElement = playlistContainerRefs.current[playlistIndex];
                        handlePlayTrack(
                          track,
                          playlist,
                          containerElement,
                          { id: `playlist_profile_all_${playlist.id}`, type: "playlist" }
                        );
                      }}
                    >
                      <div className="track-number">{trackIndex + 1}</div>
                      <div className="track-content">
                        <div className="track-text">
                          <span>{track.title}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {Array.isArray(playlist.tracks) && playlist.tracks.length > 0 && (
                    <div className="view-more" onClick={() => window.location.href = `/ManagerPlaylistLayout/${playlist.id}`}>
                      <span>View {playlist.tracks.length} tracks</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    )}

  {/* All Tracks */}
  <h2 style={{ marginTop: 0, marginLeft: 10, color: "white" }}>Tracks</h2>
  {isLoading && <p>Đang tải danh sách bài hát của bạn...</p>}
  {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
  {!isLoading && !error && songs.length === 0 && (
    <p>Bạn chưa tải lên bài hát nào.</p>
  )}
  <div className="all-tracks-list">
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
        {/* ...phần render bài hát giữ nguyên... */}
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
            onEdit={() => setEditingSongId(Number(song.id))}
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
</div>
  );
};

export default SongList;
