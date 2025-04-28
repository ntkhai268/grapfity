import React, { useEffect, useState, useRef } from "react"; // Import useRef
import { useNavigate } from "react-router-dom";
// Import hook xử lý waveform và play track
import handlePlayTrack, { initFirstWaveforms } from "../../hooks/Manager_Playlist"; // Ensure this imports the refactored version
// Import hàm API để lấy playlist từ server
import { getMyPlaylistsAPI } from "../../services/playlistService";
// Import kiểu dữ liệu
// Định nghĩa kiểu TrackItem (giữ nguyên)
interface TrackItem {
    id: number | string;
    title: string;
    src: string;
    artist: string;
    cover: string;
}
// Định nghĩa kiểu PlaylistData (giữ nguyên)
interface PlaylistData {
    id: number;
    title: string;
    artist: string;
    timeAgo: string;
    cover: string;
    tracks: TrackItem[];
}


const Playlist: React.FC = () => {
    // State cho playlists, loading và error
    const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Ref để lưu trữ tham chiếu đến các DOM element của player-container
    const playlistContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

    // useEffect để fetch dữ liệu (giữ nguyên)
    useEffect(() => {
        const fetchPlaylists = async () => {
            setIsLoading(true);
            setError(null);
            setPlaylists([]);
            try {
                console.log("Playlist Component: Calling getMyPlaylistsAPI...");
                const fetchedPlaylists = await getMyPlaylistsAPI();
                setPlaylists(fetchedPlaylists);
                 // Khởi tạo kích thước mảng refs sau khi có dữ liệu
                playlistContainerRefs.current = fetchedPlaylists.map(() => null);
                console.log("Playlist Component: Playlists fetched successfully.");
            } catch (err: any) {
                console.error("Playlist Component: Failed to fetch playlists:", err);
                if (err.message === 'Unauthorized') {
                     setError("Vui lòng đăng nhập để xem playlist.");
                } else {
                     setError("Không thể tải danh sách playlist. Vui lòng thử lại sau.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    // useEffect để khởi tạo waveform (giữ nguyên, nhưng lưu ý nó có thể cần refactor)
    useEffect(() => {
        if (!isLoading && !error && playlists.length > 0) {
            const initTimer = setTimeout(() => {
                console.log("Playlist Component: Attempting to init waveforms (might need refactor)...");
                try {
                   initFirstWaveforms();
                } catch (waveformError) {
                   console.error("Playlist Component: Error initializing waveforms:", waveformError);
                }
            }, 100);
            return () => clearTimeout(initTimer);
        }
    }, [playlists, isLoading, error]);

    // Conditional Rendering (giữ nguyên)
    if (isLoading) {
        return <div className="content playlist">Đang tải playlist...</div>;
    }
    if (error) {
        return <div className="content playlist">Lỗi: {error}</div>;
    }

    // Render danh sách playlist
    return (
        <div className="content playlist">
            {playlists.length === 0 ? (
                <div>Bạn chưa có playlist nào.</div>
            ) : (
                // Lặp qua playlists, lấy cả index
                playlists.map((playlist, playlistIndex) => (
                    <div
                        className="player-container"
                        key={playlist.id}
                        // --- SỬA LẠI REF CALLBACK ---
                        // Thêm dấu ngoặc nhọn {} để hàm không trả về giá trị
                        ref={el => { playlistContainerRefs.current[playlistIndex] = el; }}
                    >
                        <div className="track-info">
                            {/* ... album art, playlist details ... */}
                             <div className="album-art">
                                 <img
                                     src={playlist.cover}
                                     alt={`Cover of ${playlist.title}`}
                                     className="playlist-cover"
                                     onError={(e) => (e.currentTarget.src = '/assets/default_playlist_cover.png')}
                                 />
                             </div>
                             <div className="track-details">
                                 <div className="artist-info">
                                     <span className="artist-name">{playlist.artist}</span>
                                     <span className="time-ago">{playlist.timeAgo}</span>
                                 </div>
                                 <h2
                                     className="track-title clickable"
                                     onClick={() => navigate(`/ManagerPlaylistLayout/${playlist.id}`)}
                                     style={{ cursor: "pointer", color: "#1db954" }}
                                     title={`Go to playlist: ${playlist.title}`}
                                 >
                                     {playlist.title}
                                 </h2>
                                 <div className="waveform">
                                     <div className="audio-playlist"></div>
                                 </div>
                                 <div className="track-list">
                                     {/* Lặp qua tracks, lấy cả index */}
                                     {playlist.tracks.map((track, trackIndex) => (
                                         <div
                                             className="track-item"
                                             key={track.id || trackIndex}
                                             onClick={() => {
                                                 const containerElement = playlistContainerRefs.current[playlistIndex];
                                                 console.log(`Playing track: ${track.title} from playlist: ${playlist.title}`);
                                                 handlePlayTrack(track, playlist, containerElement);
                                             }}
                                             title={`Play: ${track.title}`}
                                         >
                                             <div className="track-number">{trackIndex + 1}</div>
                                             <div className="track-content">
                                                 <div className="track-text">
                                                     <span>{track.title}</span>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                     {/* ... view more ... */}
                                      {playlist.tracks.length > 0 && (
                                          <div className="view-more">
                                              <span>View {playlist.tracks.length} tracks</span>
                                          </div>
                                      )}
                                 </div>
                             </div>
                        </div>
                        {/* ... action buttons ... */}
                         <div className="action-buttons">
                            <button className="btn-like"><i className="far fa-heart"></i> 12</button>
                            <button className="btn-repost"><i className="fas fa-retweet"></i> 1</button>
                            <button className="btn-share"><i className="fas fa-share-alt"></i> Share</button>
                            <button className="btn-copy-link"><i className="fas fa-link"></i> Copy Link</button>
                            <button className="btn-next-up"><i className="fas fa-list"></i> Add to Next up</button>
                         </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Playlist;
