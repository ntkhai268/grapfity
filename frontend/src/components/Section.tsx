import React, { useState, useEffect } from "react"; // Thêm React nếu chưa có
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';
// Import GlobalAudioManager và các kiểu dữ liệu cần thiết
// Đảm bảo đường dẫn này chính xác
import GlobalAudioManager, { Song, PlaylistContext } from "../hooks/GlobalAudioManager"; 

// Import service API và kiểu dữ liệu TrackData
// Đảm bảo đường dẫn này chính xác
import {TrackData } from "../services/trackServiceAPI";
import { PlaylistData } from "../components/Manager_Playlists/ManagerDataPlaylist";
import { getAllPublicPlaylistsAPI } from "../services/playlistService"; 
import { getTop10PopularTracksAPI, getHomeRecommendationsAPI  } from "../services/listeningService";
import { encodeBase62WithPrefix  } from "../hooks/base62";
import { fetchListeningHistory, ListeningHistoryRecord } from "../services/listeningService"; // Import hàm fetchListeningHistory nếu cần


import "../styles/Section.css"; // Đảm bảo đường dẫn CSS đúng
const BACKEND_URL = 'http://localhost:8080';
// Hàm map tạm thời từ TrackData sang Song (bạn có thể đặt ở nơi khác)
function normalizeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url; // đã chuẩn URL
  return `${BACKEND_URL}/${url.replace(/^\/+/, '')}`;
}

export const mapTrackDataToSong = (track: TrackData): Song => ({
  id: track.id,
  src: normalizeUrl(track.src) || '',   // chuẩn hóa URL nếu cần
  title: track.title === null ? undefined : track.title,
  artist: track.artist === null ? undefined : track.artist,
  cover: normalizeUrl(track.cover),
});
const Section: React.FC = () => { // Thêm kiểu React.FC
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    // State lưu trữ mảng Song[] (đã sửa kiểu)
    const [allTracks, setAllTracks] = useState<Song[]>([]); 
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const [recomTracks, setRecomTracks] = useState<Song[]>([]);
    const [topTracks, setTopTracks] = useState<Song[]>([]);
    const [isLoadingTop, setIsLoadingTop] = useState<boolean>(true);  
    const [error, setError] = useState<string | null>(null);    
    const [currentPlayingId, setCurrentPlayingId] = useState<string | number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [, setPublicPlaylists] = useState<PlaylistData[]>([]);

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        const fetchTracks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // fetchedTracks có kiểu TrackData[]
                const fetchedRecords: ListeningHistoryRecord[] = await fetchListeningHistory();

                const fetchedTracks: TrackData[] = fetchedRecords.map(record => {
                const track = record.track;
                const metadata = record.metadata;

                return {
                    id: track.id,
                    title: metadata?.trackname || 'Unknown',
                    artist: track.User?.UploaderName || 'Unknown',
                    src: track.trackUrl,
                    cover: track.imageUrl,
                    // Nếu TrackData có thêm các trường khác như privacy, createdAt, ... thì thêm vào
                    // privacy: track.privacy,
                    // createdAt: track.createdAt,
                };
                });
                
                // Ánh xạ từ TrackData[] sang Song[]
                const songs: Song[] = fetchedTracks.map(mapTrackDataToSong);

                // Cập nhật state với mảng Song[]
                setAllTracks(songs); 

            } catch (err: any) {
                console.error("Failed to fetch tracks:", err);
                setError(err.message || "Không thể tải danh sách bài hát.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTracks();
    }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

    useEffect(() => {
        setIsLoadingTop(true);
        const fetchRecomTracks = async () => {
            try {
                const recomTracksRaw: TrackData[] = await getHomeRecommendationsAPI();
                 console.log("check dữ liệu thô", recomTracksRaw); // check dữ liệu thô
                const topSongs: Song[] = recomTracksRaw.map(mapTrackDataToSong);
                 console.log("Mapped top songs:", topSongs);
                setRecomTracks(topSongs);
            } catch (err) {
                console.error("Failed to fetch top 10 tracks:", err);
            } finally {
                setIsLoadingTop(false);
            }
        };
        fetchRecomTracks();
    }, []);

    useEffect(() => {
        setIsLoadingTop(true);
        const fetchTopTracks = async () => {
            try {
                const topTracksRaw: TrackData[] = await getTop10PopularTracksAPI();
                 console.log("check dữ liệu thô", topTracksRaw); // check dữ liệu thô
                const topSongs: Song[] = topTracksRaw.map(mapTrackDataToSong);
                 console.log("Mapped top songs:", topSongs);
                setTopTracks(topSongs);
            } catch (err) {
                console.error("Failed to fetch top 10 tracks:", err);
            } finally {
                setIsLoadingTop(false);
            }
        };
        fetchTopTracks();
    }, []);


    // --- Chia nhỏ dữ liệu (sử dụng mảng Song[] đã map) ---
    // Kiểu dữ liệu của các mảng này giờ đã đúng là Song[]
    const recommendedTracks: Song[] = recomTracks
    const top10Tracks: Song[] = topTracks; // Sử dụng mảng topTracks đã map
    console.log("recommendedTracks:", recommendedTracks);
 
    const publicTracks: Song[] = allTracks; 
    const currentContext = GlobalAudioManager.getCurrentContext();

    const handleSidebarExpandChange = (expanded: boolean) => {
        setSidebarExpanded(expanded);
    };

    useEffect(() => {
    const unsubscribe = GlobalAudioManager.subscribe(() => {
        const song = GlobalAudioManager.getCurrentSong();
        setCurrentPlayingId(song?.id || null);
        setIsPlaying(GlobalAudioManager.getIsPlaying());
    });

    return () => unsubscribe();
    }, []);

    // Hàm xử lý click, nhận danh sách Song[] và index
    // Thêm tham số 'type' và 'contextId' để xác định ngữ cảnh playlist
    // const handleClick = (list: Song[], index: number, type: PlaylistContext['type'], contextId: string | number = type) => {
    //     if (!list || list.length === 0 || index < 0 || index >= list.length) {
    //         console.error("Invalid list or index for handleClick");
    //         return;
    //     }
    //     const song = list[index];
        
    //     // Tạo đối tượng context
    //     const playlistContext: PlaylistContext = {
    //         id: contextId, // Dùng type làm ID tạm thời hoặc một ID cụ thể hơn nếu có
    //         type: type 
    //     };

    //     // --- SỬA LỖI GỌI setPlaylist ---
    //     // Gọi setPlaylist với đủ 3 tham số bắt buộc: list, index, context
    //     GlobalAudioManager.setPlaylist(list, index, playlistContext); 
        
    //     // Gọi playSongAt để bắt đầu phát bài hát đã chọn
    //     // (setPlaylist không tự động phát)
    //     GlobalAudioManager.playSongAt(index);

    //     // Chuyển hướng đến trang ManagerSong (nếu bạn vẫn muốn giữ lại)
    //     navigate("/ManagerSong", {
    //         state: {
    //             // Gửi state nếu trang ManagerSong cần thông tin này ngay lập tức
    //             songs: list, 
    //             currentIndex: index,
    //             currentSong: song,
    //         },
    //     });
    //     // ---------------------------------------

    // };


 const handleClicktest = (
    song: Song,
    list: Song[],
    index: number,
    type: PlaylistContext['type'],
    contextId: string | number = type
) => {
    // 👉 1. Lưu vào localStorage để chống mất khi reload
    localStorage.setItem("viewedSong", JSON.stringify(song));
    localStorage.setItem("viewedPlaylist", JSON.stringify(list));
    localStorage.setItem("viewedIndex", index.toString());

    // Mã hóa ID 
    const encodedId = encodeBase62WithPrefix(Number(song.id), 22); // hoặc 16-22 tùy độ dài bạn muốn

    //  Điều hướng sang trang ManagerSong, truyền kèm state
    navigate(`/ManagerSong/${encodedId}`, {
        state: {
            songs: list,
            currentIndex: index,
            currentSong: song,
            context: { id: contextId, type },
        },
    });
};



    const handlePlayButtonClick = (
        list: Song[],
        index: number,
        type: PlaylistContext['type'],
        contextId: string | number = type
        ) => {
        const clickedSong = list[index];
        const currentSong = GlobalAudioManager.getCurrentSong();
        const isCurrentlyPlaying = GlobalAudioManager.getIsPlaying();
        

        const context: PlaylistContext = {
            id: contextId,
            type: type
        };
         const sameSong = currentSong?.id === clickedSong.id;
        const sameContext =
            currentContext?.id === context.id &&
            currentContext?.type === context.type;

        // Nếu chưa có bài hát nào, hoặc bài khác đang phát → chuyển playlist và phát
        if (!sameSong || !sameContext) {
            GlobalAudioManager.setPlaylist(list, index, context);
            GlobalAudioManager.playSongAt(index);
            return;
        }

        // Nếu là bài hiện tại → toggle play/pause
        if (isCurrentlyPlaying) {
            GlobalAudioManager.pausePlayback();
        } else {
            GlobalAudioManager.playAudio(GlobalAudioManager.getAudioElement()!, clickedSong, context);
        }
    };
    // /fetch lấy dữ liệu playlist public của mọi người
    useEffect(() => {
        const fetchPublicPlaylists = async () => {
        try {
            const playlists: PlaylistData[] = await getAllPublicPlaylistsAPI();
            setPublicPlaylists(playlists);
            } catch (err) {
            console.error("Lỗi khi tải playlist công khai:", err);
            }
        };

        fetchPublicPlaylists();
    }, []);


    return (
        <>
            <Sidebar onExpandChange={handleSidebarExpandChange} />
            <section className={`song_side ${sidebarExpanded ? "shrink" : ""}`}>

                {/* Hiển thị trạng thái loading hoặc lỗi */}
                {isLoading && <div>Đang tải...</div>}
                {error && <div style={{ color: 'red' }}>Lỗi: {error}</div>}

                {/* Chỉ hiển thị nội dung khi không loading và không có lỗi */}
                {!isLoading && !error && (
                    <>
                        {/* --- SECTION 1: RECOMMENDED --- */}         

                        <h1>Recommend For You</h1>
                        <div className="song-list">
                        {isLoadingTop ? (
                            <div>Đang tải top 10 bài hát phổ biến...</div>
                        ) : recommendedTracks.length > 0 ? (
                            recommendedTracks.map((song, index) => {
                            // console.log(`Song #${index + 1}:`);
                            // console.log("  Title:", song.title);
                            // console.log("  Artist:", song.artist);
                            // console.log("  Cover URL:", song.cover);
                            // console.log("  Audio src:", song.src);

                            return (
                                <button
                                key={`rec-${song.id}-${index}`}
                                className="song-item-section"
                                onClick={() => handleClicktest(song, recommendedTracks, index, 'queue', 'recommended')}
                                >
                                <div className="song-image-wrapper">
                                    <img src={song.cover || 'assets/anhmau.png'} alt={song.title} />
                                    <div
                                    className="play-button-section"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlayButtonClick(recommendedTracks, index, 'queue', 'recommended');
                                    }}
                                    >
                                    <i
                                        className={
                                        currentPlayingId === song.id &&
                                        isPlaying &&
                                        currentContext?.type === 'queue' &&
                                        currentContext?.id === 'recommended'
                                            ? "fas fa-pause"
                                            : "fas fa-play"
                                        }
                                        style={{ color: "black" }}
                                    ></i>
                                    </div>
                                </div>
                                <p className="title" title={song.title}>{song.title || 'Unknown Title'}</p>
                                <p className="artist">{song.artist || 'Unknown Artist'}</p>
                                </button>
                            );
                            })
                        ) : (
                            <p>Không có bài hát nào được đề xuất.</p>
                        )}
                        </div>

                       <h1>Popular Tracks</h1>
                        <div className="song-list">
                        {isLoadingTop ? (
                            <div>Đang tải top 10 bài hát phổ biến...</div>
                        ) : top10Tracks.length > 0 ? (
                            top10Tracks.map((song, index) => {
                            // console.log(`Song #${index + 1}:`);
                            // console.log("  Title:", song.title);
                            // console.log("  Artist:", song.artist);
                            // console.log("  Cover URL:", song.cover);
                            // console.log("  Audio src:", song.src);

                            return (
                                <button
                                key={`top-${song.id}-${index}`}
                                className="song-item-section"
                                onClick={() => handleClicktest(song, top10Tracks, index, 'queue', 'top10')}
                                >
                                <div className="song-image-wrapper">
                                    <img src={song.cover || 'assets/anhmau.png'} alt={song.title} />
                                    <div
                                    className="play-button-section"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlayButtonClick(top10Tracks, index, 'queue', 'top10');
                                    }}
                                    >
                                    <i
                                        className={
                                        currentPlayingId === song.id &&
                                        isPlaying &&
                                        currentContext?.type === 'queue' &&
                                        currentContext?.id === 'top10'
                                            ? "fas fa-pause"
                                            : "fas fa-play"
                                        }
                                        style={{ color: "black" }}
                                    ></i>
                                    </div>
                                </div>
                                <p className="title" title={song.title}>{song.title || 'Unknown Title'}</p>
                                <p className="artist">{song.artist || 'Unknown Artist'}</p>
                                </button>
                            );
                            })
                        ) : (
                            <p>Không có bài hát nào được đề xuất.</p>
                        )}
                        </div>


                        {/* --- SECTION 2: RECENTLY RELEASED --- */}
                         {/* <h1>Recently released</h1>
                        <div className="song-list song-list-circle">
                            {recentTracks.length > 0 ? (
                                recentTracks.map((song, index) => (
                                     // Truyền context type là 'queue' và id là 'recent' (ví dụ)
                                    <button key={`rel-${song.id}-${index}`} className="song-item-section" onClick={() => handleClick(recentTracks, index, 'queue', 'recent')}>
                                        <img src={song.cover || 'assets/anhmau.png'} alt={song.title} />
                                    </button>
                                ))
                            ) : (
                                <p>Chưa có bài hát mới.</p>
                            )}
                        </div> */}

                        {/* --- SECTION 3: POPULAR --- */}
                        {/* <h1>Playlists</h1>
                        <div className="song-list">
                            {publicPlaylists.length > 0 ? (
                                publicPlaylists.map((playlist, index) => (
                                <button
                                    key={`playlist-${playlist.id}-${index}`}
                                    className="song-item-section"
                                    onClick={() => {
                                    // 👉 Chuyển đến trang hiển thị playlist chi tiết
                                        navigate(`/ManagerPlaylistLayout/${playlist.id}`)
                                    }}
                                >
                                    <img src={playlist.cover || 'assets/anhmau.png'} alt={playlist.title} />
                                    <p className="title" title={playlist.title}>{playlist.title}</p>
                                    <p className="artist">{playlist.artist}</p>
                                </button>
                                ))
                            ) : (
                                <p>Không có playlist công khai nào.</p>
                            )}
                        </div> */}

                        {/* ------------------------- */}
                        {/* --- SECTION 4: Tracks --- */}
                        <h1>Recently Played</h1>
                        <div className="song-list">
                            {publicTracks.length > 0 ? (
                                publicTracks.map((song, index) => (
                                    // Truyền context type là 'queue' và id là 'recommended' (ví dụ)
                                        <button
                                            key={`rec-${song.id}-${index}`}
                                            className="song-item-section"
                                           onClick={() => handleClicktest(song, publicTracks, index, 'queue', 'tracks')}

                                            >
                                            <div className="song-image-wrapper">
                                                <img src={song.cover || 'assets/anhmau.png'} alt={song.title} />
                                                
                                                <div
                                                className="play-button-section"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Ngăn chuyển trang
                                                    handlePlayButtonClick(publicTracks, index, 'queue', 'tracks');
                                                }}
                                                >
                                                <i
                                                    className={
                                                     currentPlayingId === song.id && isPlaying &&  currentContext?.type === 'queue' &&  currentContext?.id === 'tracks'
                                                        ? "fas fa-pause"
                                                        : "fas fa-play"
                                                    }
                                                    style={{ color: "black" }}
                                                ></i>
                                                </div>
                                            </div>

                                            <p className="title" title={song.title}>{song.title || 'Unknown Title'}</p>
                                            <p className="artist">{song.artist || 'Unknown Artist'}</p>
                                        </button>

                                ))
                            ) : (
                                <p>Không có bài hát nào được đề xuất.</p>
                            )}
                        </div>
                </>
                )}
            </section>
        </>
    );
};

export default Section;