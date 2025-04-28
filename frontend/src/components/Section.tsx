import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';
import GlobalAudioManager from "../hooks/GlobalAudioManager";

// Import service API và kiểu dữ liệu TrackData
import { getAllTracksAPI, TrackData } from "../services/trackServiceAPI";

import "../styles/Section.css";

const Section = () => {
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    // State để lưu dữ liệu từ API
    const [allTracks, setAllTracks] = useState<TrackData[]>([]); // Lưu tất cả track từ API
    const [isLoading, setIsLoading] = useState<boolean>(true);   // Trạng thái loading
    const [error, setError] = useState<string | null>(null);     // Lưu lỗi nếu có

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        const fetchTracks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedTracks = await getAllTracksAPI();
                setAllTracks(fetchedTracks); // Lưu tất cả tracks vào state
            } catch (err: any) {
                console.error("Failed to fetch tracks:", err);
                setError(err.message || "Không thể tải danh sách bài hát.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTracks();
    }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

    // --- TẠM THỜI CHIA NHỎ DỮ LIỆU (PLACEHOLDER) ---
    // !!! LƯU Ý: Logic slice này chỉ là tạm thời để giữ cấu trúc.
    // !!! SAU NÀY: Bạn cần thay thế bằng cách lấy dữ liệu đúng cho từng mục.
    const recommendedTracks = allTracks.slice(0, 3); // Ví dụ: Lấy 4 bài đầu
    const recentTracks = allTracks.slice(3, 7);     // Ví dụ: Lấy 4 bài tiếp theo
    const popularTracks = allTracks.slice(7, 10);   // Ví dụ: Lấy 4 bài tiếp theo

    const handleSidebarExpandChange = (expanded: boolean) => {
        setSidebarExpanded(expanded);
    };

    // Hàm xử lý click, nhận danh sách tương ứng với mục được click
    const handleClick = (list: TrackData[], index: number) => {
        if (!list || list.length === 0 || index < 0 || index >= list.length) {
            console.error("Invalid list or index for handleClick");
            return;
        }
        const song = list[index];
        GlobalAudioManager.setPlaylist(list, index); // Sử dụng danh sách của mục đó
        GlobalAudioManager.playSongAt(index);
        navigate("/ManagerSong", {
            state: {
                songs: list, // Gửi danh sách của mục đó
                currentIndex: index,
                currentSong: song,
            },
        });
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
                            {/* Sử dụng recommendedTracks */}
                            {recommendedTracks.length > 0 ? (
                                recommendedTracks.map((song, index) => (
                                    // Truyền recommendedTracks vào handleClick
                                    <button key={`rec-${song.id}-${index}`} className="song-item" onClick={() => handleClick(recommendedTracks, index)}>
                                        <img src={song.cover} alt={song.title} />
                                        <p className="title">{song.title}</p>
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
                            {/* Sử dụng recentTracks */}
                            {recentTracks.length > 0 ? (
                                recentTracks.map((song, index) => (
                                    // Truyền recentTracks vào handleClick
                                    <button key={`rel-${song.id}-${index}`} className="song-item" onClick={() => handleClick(recentTracks, index)}>
                                        <img src={song.cover} alt={song.title} />
                                    </button>
                                ))
                            ) : (
                                <p>Chưa có bài hát mới.</p>
                            )}
                        </div>

                        {/* --- SECTION 3: POPULAR --- */}
                        <h1>Popular albums and singles</h1>
                        <div className="song-list">
                            {/* Sử dụng popularTracks */}
                            {popularTracks.length > 0 ? (
                                popularTracks.map((song, index) => (
                                    // Truyền popularTracks vào handleClick
                                    <button key={`pop-${song.id}-${index}`} className="song-item" onClick={() => handleClick(popularTracks, index)}>
                                        <img src={song.cover} alt={song.title} />
                                        <p className="title">{song.title}</p>
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