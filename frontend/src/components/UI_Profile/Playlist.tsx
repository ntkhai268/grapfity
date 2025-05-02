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
    cover: string | null; // Cho phép cover là null
    tracks: TrackItem[];
}

// --- THÊM LẠI CÁC ĐỊNH NGHĨA SVG ---
// SVG Paths
const svgIconMusicNote = "M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z";
const svgIconEdit = "M17.318 1.975a3.329 3.329 0 1 1 4.707 4.707L8.451 20.256c-.49.49-1.082.867-1.735 1.103L2.34 22.94a1 1 0 0 1-1.28-1.28l1.581-4.376a4.726 4.726 0 0 1 1.103-1.735L17.318 1.975zm3.293 1.414a1.329 1.329 0 0 0-1.88 0L5.159 16.963c-.283.283-.5.624-.636 1l-.857 2.372 2.371-.857a2.726 2.726 0 0 0 1.001-.636L20.611 5.268a1.329 1.329 0 0 0 0-1.879z";
// ------------------------------------------

const Playlist: React.FC = () => {
    // State cho playlists, loading và error
    const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Ref để lưu trữ tham chiếu đến các DOM element của player-container
    const playlistContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

    // --- THÊM LẠI CÁC STATE CHO ẢNH/ICON ---
    // State để theo dõi lỗi ảnh và trạng thái hover cho từng playlist
    const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});
    const [hoveringIconMap, setHoveringIconMap] = useState<Record<number, boolean>>({});
    // ------------------------------------

    // useEffect để fetch dữ liệu
    useEffect(() => {
        const fetchPlaylists = async () => {
            setIsLoading(true);
            setError(null);
            setPlaylists([]);
            setImageErrorMap({}); // Reset lỗi ảnh
            setHoveringIconMap({}); // Reset hover
            try {
                const fetchedPlaylists = await getMyPlaylistsAPI();
                setPlaylists(fetchedPlaylists);
                playlistContainerRefs.current = fetchedPlaylists.map(() => null);
            } catch (err: any) {
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

    // useEffect để khởi tạo waveform (cần xem xét lại initFirstWaveforms)
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

    // --- THÊM LẠI CÁC HÀM XỬ LÝ ẢNH/ICON ---
    // Hàm xử lý lỗi ảnh cho từng playlist
    const handleImageError = (playlistId: number) => {
        setImageErrorMap(prev => ({ ...prev, [playlistId]: true }));
    };

    // Hàm xử lý hover cho từng playlist
    const handleMouseEnterIcon = (playlistId: number) => {
        setHoveringIconMap(prev => ({ ...prev, [playlistId]: true }));
    };
    const handleMouseLeaveIcon = (playlistId: number) => {
        setHoveringIconMap(prev => ({ ...prev, [playlistId]: false }));
    };
    // ----------------------------------------


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
                playlists.map((playlist, playlistIndex) => {
                    // Lấy trạng thái lỗi và hover cho playlist hiện tại
                    const hasImageError = imageErrorMap[playlist.id] || false;
                    const isHoveringIcon = hoveringIconMap[playlist.id] || false; // <-- Sử dụng state này

                    return (
                        <div
                            className="player-container"
                            key={playlist.id}
                            ref={el => { playlistContainerRefs.current[playlistIndex] = el; }}
                        >
                            <div className="track-info">
                                {/* --- SỬA LẠI PHẦN HIỂN THỊ ẢNH/SVG --- */}
                                <div className="album-art">
                                    {/* Hiển thị ảnh thật NẾU có cover VÀ chưa bị lỗi */}
                                    {playlist.cover && !hasImageError ? (
                                        <img
                                            src={playlist.cover} // <-- URL đầy đủ từ backend
                                            alt={playlist.title}
                                            className="playlist-cover" // Class cho ảnh thật
                                            onError={() => handleImageError(playlist.id)} // Gọi hàm xử lý lỗi
                                        />
                                    ) : (
                                        // Hiển thị SVG mặc định nếu không có cover hoặc ảnh thật bị lỗi
                                        <div
                                            className="playlist-cover default-icon-container" // Dùng chung class hoặc tạo class riêng
                                            onMouseEnter={() => handleMouseEnterIcon(playlist.id)} // Gọi hàm xử lý hover
                                            onMouseLeave={() => handleMouseLeaveIcon(playlist.id)} // Gọi hàm xử lý hover
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" > {/* Kích thước nhỏ hơn cho danh sách */}
                                                {/* Chọn path dựa trên trạng thái hover */}
                                                <path d={isHoveringIcon ? svgIconEdit : svgIconMusicNote}></path> {/* Sử dụng biến SVG */}
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="track-details">
                                    {/* ... artist info, title, waveform, track list ... */}
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
                                         {playlist.tracks.map((track, trackIndex) => (
                                             <div
                                                 className="track-item"
                                                 key={track.id || trackIndex}
                                                 onClick={() => {
                                                     const containerElement = playlistContainerRefs.current[playlistIndex];
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
                    );
                })
            )}
        </div>
    );
};

export default Playlist;