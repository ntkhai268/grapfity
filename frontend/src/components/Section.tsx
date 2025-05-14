import React, { useState, useEffect } from "react"; // Thêm React nếu chưa có
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';
// Import GlobalAudioManager và các kiểu dữ liệu cần thiết
// Đảm bảo đường dẫn này chính xác
import GlobalAudioManager, { Song, PlaylistContext } from "../hooks/GlobalAudioManager"; 

// Import service API và kiểu dữ liệu TrackData
// Đảm bảo đường dẫn này chính xác
import { getAllTracksAPI, TrackData } from "../services/trackServiceAPI";


import "../styles/Section.css"; // Đảm bảo đường dẫn CSS đúng

// Hàm map tạm thời từ TrackData sang Song (bạn có thể đặt ở nơi khác)
const mapTrackDataToSong = (track: TrackData): Song => ({
    id: track.id, // Giả sử TrackData có id
    src: track.src || '', // Giả sử TrackData có src
    // Đảm bảo title là string hoặc undefined, nếu là null thì chuyển thành undefined
    title: track.title === null ? undefined : track.title, 
    // Đảm bảo artist là string hoặc undefined
    artist: track.artist === null ? undefined : track.artist, 
    // Đảm bảo cover là string hoặc undefined
    cover: track.cover === null ? undefined : track.cover 
});

const Section: React.FC = () => { // Thêm kiểu React.FC
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    // State lưu trữ mảng Song[] (đã sửa kiểu)
    const [allTracks, setAllTracks] = useState<Song[]>([]); 
    const [isLoading, setIsLoading] = useState<boolean>(true);   
    const [error, setError] = useState<string | null>(null);    

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        const fetchTracks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // fetchedTracks có kiểu TrackData[]
                const fetchedTracks: TrackData[] = await getAllTracksAPI(); 
                
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

    // --- Chia nhỏ dữ liệu (sử dụng mảng Song[] đã map) ---
    // Kiểu dữ liệu của các mảng này giờ đã đúng là Song[]
    const recommendedTracks: Song[] = allTracks.slice(0, 3); 
    const recentTracks: Song[] = allTracks.slice(3, 7);     
    const popularTracks: Song[] = allTracks.slice(7, 15);   

    const handleSidebarExpandChange = (expanded: boolean) => {
        setSidebarExpanded(expanded);
    };

    // Hàm xử lý click, nhận danh sách Song[] và index
    // Thêm tham số 'type' và 'contextId' để xác định ngữ cảnh playlist
    const handleClick = (list: Song[], index: number, type: PlaylistContext['type'], contextId: string | number = type) => {
        if (!list || list.length === 0 || index < 0 || index >= list.length) {
            console.error("Invalid list or index for handleClick");
            return;
        }
        const song = list[index];
        
        // Tạo đối tượng context
        const playlistContext: PlaylistContext = {
            id: contextId, // Dùng type làm ID tạm thời hoặc một ID cụ thể hơn nếu có
            type: type 
        };

        // --- SỬA LỖI GỌI setPlaylist ---
        // Gọi setPlaylist với đủ 3 tham số bắt buộc: list, index, context
        GlobalAudioManager.setPlaylist(list, index, playlistContext); 
        
        // Gọi playSongAt để bắt đầu phát bài hát đã chọn
        // (setPlaylist không tự động phát)
        GlobalAudioManager.playSongAt(index);

        // Chuyển hướng đến trang ManagerSong (nếu bạn vẫn muốn giữ lại)
        navigate("/ManagerSong", {
            state: {
                // Gửi state nếu trang ManagerSong cần thông tin này ngay lập tức
                songs: list, 
                currentIndex: index,
                currentSong: song,
            },
        });
        // ---------------------------------------

    };

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
                        <h1>Recommended for today</h1>
                        <div className="song-list">
                            {recommendedTracks.length > 0 ? (
                                recommendedTracks.map((song, index) => (
                                    // Truyền context type là 'queue' và id là 'recommended' (ví dụ)
                                    <button key={`rec-${song.id}-${index}`} className="song-item" onClick={() => handleClick(recommendedTracks, index, 'queue', 'recommended')}> 
                                        <img src={song.cover || 'assets/anhmau.png'} alt={song.title} />
                                        <p className="title">{song.title || 'Unknown Title'}</p>
                                        <p className="artist">{song.artist || 'Unknown Artist'}</p>
                                    </button>
                                ))
                            ) : (
                                <p>Không có bài hát nào được đề xuất.</p>
                            )}
                        </div>

                        {/* --- SECTION 2: RECENTLY RELEASED --- */}
                        <h1>Recently released</h1>
                        <div className="song-list song-list-circle">
                            {recentTracks.length > 0 ? (
                                recentTracks.map((song, index) => (
                                     // Truyền context type là 'queue' và id là 'recent' (ví dụ)
                                    <button key={`rel-${song.id}-${index}`} className="song-item" onClick={() => handleClick(recentTracks, index, 'queue', 'recent')}>
                                        <img src={song.cover || 'assets/anhmau.png'} alt={song.title} />
                                    </button>
                                ))
                            ) : (
                                <p>Chưa có bài hát mới.</p>
                            )}
                        </div>

                        {/* --- SECTION 3: POPULAR --- */}
                        <h1>Popular albums and singles</h1>
                        <div className="song-list">
                            {popularTracks.length > 0 ? (
                                popularTracks.map((song, index) => (
                                     // Truyền context type là 'queue' và id là 'popular' (ví dụ)
                                    <button key={`pop-${song.id}-${index}`} className="song-item" onClick={() => handleClick(popularTracks, index, 'queue', 'popular')}>
                                        <img src={song.cover || 'assets/anhmau.png'} alt={song.title} />
                                        <p className="title">{song.title || 'Unknown Title'}</p>
                                        <p className="artist">{song.artist || 'Unknown Artist'}</p>
                                    </button>
                                ))
                            ) : (
                                <p>Chưa có album/single phổ biến.</p>
                            )}
                        </div>
                    </>
                )}
            </section>
        </>
    );
};

export default Section;
