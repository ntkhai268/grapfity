import { useEffect, useState, useRef } from "react"; // Import useRef
import * as React from 'react';

import { useNavigate } from "react-router-dom";
// Import hook xử lý waveform và play track
import handlePlayTrack, { initFirstWaveforms } from "../../hooks/Manager_Playlist"; // Ensure this imports the refactored version
// Import hàm API để lấy playlist từ server
import { getMyPlaylistsAPI,getPublicPlaylistsByUserIdAPI } from "../../services/playlistService";
// Import kiểu dữ liệu
// Định nghĩa kiểu TrackItem (giữ nguyên)
export interface TrackItem {
    id: number | string;
    title: string;
    src: string;
    artist: string;
    cover: string;
    imageUrl?: string | null;
}
// Định nghĩa kiểu PlaylistData (giữ nguyên)
export interface PlaylistData {
    id: number;
    title: string;
    artist: string;
    timeAgo: string;
    cover: string | null; // Cho phép cover là null
    tracks: TrackItem[];
    imageUrl?: string | null;
}

interface PlaylistsProps {
  viewedUserId: string | number;  // ID của profile đang xem
  currentUserId: string | number ; // ID của người đang đăng nhập
}


// SVG Paths (Giữ nguyên)
const svgIconMusicNote = "M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z";
const svgIconEdit = "M17.318 1.975a3.329 3.329 0 1 1 4.707 4.707L8.451 20.256c-.49.49-1.082.867-1.735 1.103L2.34 22.94a1 1 0 0 1-1.28-1.28l1.581-4.376a4.726 4.726 0 0 1 1.103-1.735L17.318 1.975zm3.293 1.414a1.329 1.329 0 0 0-1.88 0L5.159 16.963c-.283.283-.5.624-.636 1l-.857 2.372 2.371-.857a2.726 2.726 0 0 0 1.001-.636L20.611 5.268a1.329 1.329 0 0 0 0-1.879z";


const Playlist: React.FC<PlaylistsProps> = ({ viewedUserId, currentUserId }) => {
    // State cho playlists, loading và error (Giữ nguyên)
    const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Ref để lưu trữ tham chiếu đến các DOM element của player-container (Giữ nguyên)
    const playlistContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

    // State để theo dõi lỗi ảnh và trạng thái hover cho từng playlist (Giữ nguyên)
    const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});
    const [hoveringIconMap, setHoveringIconMap] = useState<Record<number, boolean>>({});



    // useEffect khởi tạo waveform (Giữ nguyên)
    useEffect(() => {
        if (!isLoading && !error && playlists.length > 0) {
            const initTimer = setTimeout(() => {
                console.log("Playlist Component: Attempting to init waveforms...");
                try {
                   initFirstWaveforms();
                } catch (waveformError) {
                   console.error("Playlist Component: Error initializing waveforms:", waveformError);
                }
            }, 100);
            return () => clearTimeout(initTimer);
        }
    }, [playlists, isLoading, error]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            setIsLoading(true);
            setError(null);
            try {
            let fetchedPlaylists: PlaylistData[] = [];

            if (viewedUserId === currentUserId) {
                // Chủ profile xem playlist của chính mình
                fetchedPlaylists = await getMyPlaylistsAPI();
            } else {
                // Người khác xem profile => chỉ lấy playlist public của người đó
                fetchedPlaylists = await getPublicPlaylistsByUserIdAPI(viewedUserId);
            }

            setPlaylists(fetchedPlaylists);
            playlistContainerRefs.current = fetchedPlaylists.map(() => null);
            } catch (err: any) {
            setError(err.message || "Lỗi khi tải danh sách playlist.");
            setPlaylists([]);
            } finally {
            setIsLoading(false);
            }
        };

        fetchPlaylists();
    }, [viewedUserId, currentUserId]);


    // Hàm xử lý lỗi ảnh (Giữ nguyên)
    const handleImageError = (playlistId: number) => {
        setImageErrorMap(prev => ({ ...prev, [playlistId]: true }));
    };

    // Hàm xử lý hover (Giữ nguyên)
    const handleMouseEnterIcon = (playlistId: number) => {
        setHoveringIconMap(prev => ({ ...prev, [playlistId]: true }));
    };
    const handleMouseLeaveIcon = (playlistId: number) => {
        setHoveringIconMap(prev => ({ ...prev, [playlistId]: false }));
    };


    // Conditional Rendering (Giữ nguyên)
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
                    const hasImageError = imageErrorMap[playlist.id] || false;
                    const isHoveringIcon = hoveringIconMap[playlist.id] || false;
                    const coverUrlToDisplay = playlist.cover || null;

                    return (
                        <div
                            className="player-container"
                            key={playlist.id}
                            ref={el => { playlistContainerRefs.current[playlistIndex] = el; }}
                        >
                            <div className="track-info">
                                <div className="album-art">
                                    {coverUrlToDisplay && !hasImageError ? (
                                        <img
                                            src={coverUrlToDisplay}
                                            alt={playlist.title}
                                            className="playlist-cover"
                                            onError={() => handleImageError(playlist.id)}
                                        />
                                    ) : (
                                        <div
                                            className="playlist-cover default-icon-container"
                                            onMouseEnter={() => handleMouseEnterIcon(playlist.id)}
                                            onMouseLeave={() => handleMouseLeaveIcon(playlist.id)}
                                        >
                                            {/* Đảm bảo kích thước SVG phù hợp */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                                <path d={isHoveringIcon ? svgIconEdit : svgIconMusicNote}></path>
                                            </svg>
                                        </div>
                                    )}
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
                                        {/* Phần tử chứa waveform, đảm bảo có class đúng */}
                                        <div className="audio-playlist"></div>
                                    </div>
                                     {/* --- KHÔI PHỤC CẤU TRÚC HTML TRACK LIST --- */}
                                    <div className="track-list">
                                        {/* Kiểm tra playlist.tracks là mảng */}
                                        {Array.isArray(playlist.tracks) && playlist.tracks.map((track, trackIndex) => (
                                            <div
                                                className="track-item-profile" // Giữ lại class gốc
                                                key={track.id || trackIndex}
                                                onClick={() => {
                                                    const containerElement = playlistContainerRefs.current[playlistIndex];
                                                    handlePlayTrack(track, playlist, containerElement, {
                                                        id: `playlist_profile_${playlist.id}`,
                                                        type: "playlist"
                                                    });

                                                }}
                                                title={`Play: ${track.title}`}
                                            >
                                                {/* Giữ lại cấu trúc cũ với track-number và track-content */}
                                                <div className="track-number">{trackIndex + 1}</div>
                                                <div className="track-content-playlist">
                                                    <div className="track-text">
                                                        <span>{track.title}</span>
                                                        {/* Có thể thêm artist của track nếu cần */}
                                                        {/* <span className="track-artist">{track.artist}</span> */}
                                                    </div>
                                                    {/* Có thể thêm thời lượng hoặc các thông tin khác */}
                                                </div>
                                            </div>
                                        ))}
                                         {/* Có thể giữ lại nút View More nếu cần */}
                                        {Array.isArray(playlist.tracks) && playlist.tracks.length > 0 && (
                                            <div className="view-more" onClick={() => navigate(`/ManagerPlaylistLayout/${playlist.id}`)}>
                                                <span>View {playlist.tracks.length} tracks</span>
                                            </div>
                                        )}
                                    </div>
                                     {/* ------------------------------------------ */}
                                </div>
                            </div>
                            {/* Action buttons (Giữ nguyên) */}
                             <div className="action-buttons">
                                 <button className="btn-like"><i className="far fa-heart"></i></button>
                                 <button className="btn-repost"><i className="fas fa-retweet"></i></button>
                                 <button className="btn-share"><i className="fas fa-share-alt"></i> Share</button>
                                  <button className="btn-copy-link"><i className="fas fa-link"></i> Copy Link</button>
                                <button className="btn-next-up"><i className="fas fa-list"></i> Add to Next up</button>
                             </div>
                        </div>
                    );
                })
            )}
            {/* <button onClick={fetchPlaylists}>Refresh Playlists</button> */}
        </div>
    );
};

export default Playlist;
