import React, { useEffect, useState } from "react"; // Import useState, useEffect
import { useParams, useNavigate } from "react-router-dom";
// 1. Import hàm API lấy chi tiết playlist theo ID
import { getPlaylistByIdAPI } from "../../services/playlistService";
import GlobalAudioManager, { Song } from "../../hooks/GlobalAudioManager"; // Import Song type if needed by GlobalAudioManager
// 2. Import hoặc định nghĩa lại kiểu dữ liệu
interface TrackItem {
    id: number | string;
    title: string;
    src: string;
    artist: string;
    cover: string;
}
interface PlaylistData {
    id: number;
    title: string;
    artist: string;
    timeAgo: string; // Vẫn giữ nếu API trả về hoặc bạn muốn hiển thị
    cover: string;
    tracks: TrackItem[];
}

const DataPlaylist: React.FC = () => {
    const { playlistId } = useParams<{ playlistId: string }>();
    const navigate = useNavigate();

    // 3. Thêm state cho playlist, loading, error
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 4. useEffect để fetch dữ liệu khi playlistId thay đổi
    useEffect(() => {
        // Chỉ fetch nếu playlistId có giá trị
        if (!playlistId) {
            setError("ID Playlist không hợp lệ.");
            setIsLoading(false);
            return;
        }

        const numericId = Number(playlistId);
        // Kiểm tra xem có phải là số hợp lệ không
        if (isNaN(numericId)) {
             setError("ID Playlist không phải là số hợp lệ.");
             setIsLoading(false);
             return;
        }


        const fetchPlaylistDetails = async () => {
            setIsLoading(true);
            setError(null);
            setPlaylist(null); // Reset playlist trước khi fetch

            try {
                console.log(`DataPlaylist: Calling getPlaylistByIdAPI for ID: ${numericId}`);
                // Gọi API để lấy chi tiết playlist
                const fetchedPlaylist = await getPlaylistByIdAPI(numericId);

                if (fetchedPlaylist) {
                    setPlaylist(fetchedPlaylist); // Cập nhật state nếu tìm thấy
                    console.log("DataPlaylist: Playlist details fetched successfully.");
                } else {
                    // API trả về null (thường là 404 Not Found)
                    setError("Không tìm thấy playlist.");
                    console.log(`DataPlaylist: Playlist with ID ${numericId} not found.`);
                }
            } catch (err: any) {
                console.error(`DataPlaylist: Failed to fetch playlist details for ID ${numericId}:`, err);
                // Xử lý lỗi khác (ví dụ: lỗi mạng, lỗi server 500)
                 setError("Không thể tải chi tiết playlist. Vui lòng thử lại.");
            } finally {
                setIsLoading(false); // Kết thúc loading
            }
        };

        fetchPlaylistDetails(); // Gọi hàm fetch

    }, [playlistId]); // Chạy lại useEffect khi playlistId thay đổi

    // Hàm xử lý click vào bài hát (logic giữ nguyên, nhưng dùng state `playlist`)
    const handleClick = (index: number) => {
        // Đảm bảo playlist và tracks tồn tại trước khi xử lý
        if (!playlist || !playlist.tracks || !playlist.tracks[index]) {
             console.error("Cannot handle click: Playlist or track data is missing.");
             return;
        }

        const clickedSong = playlist.tracks[index];

        // Map lại tracks cho GlobalAudioManager nếu cần (đảm bảo đúng định dạng Song)
        const songsForManager: Song[] = playlist.tracks.map(track => ({
             id: track.id, // Thêm id nếu GlobalAudioManager cần
             src: track.src,
             title: track.title,
             artist: track.artist, // Sử dụng artist của track
             cover: track.cover,
        }));


        // Set playlist và play qua GlobalAudioManager
        GlobalAudioManager.setPlaylist(songsForManager, index); // Truyền mảng đã map
        GlobalAudioManager.playSongAt(index);

        // Chuyển hướng đến trang phát chi tiết (nếu muốn)
        navigate("/ManagerSong", {
            state: {
                songs: songsForManager, // Truyền mảng đã map
                currentIndex: index,
                currentSong: clickedSong, // Truyền bài hát đã click
            },
        });
    };

    // 5. Render có điều kiện
    if (isLoading) {
        return <div className="song-list-manager">Đang tải chi tiết playlist...</div>;
    }

    if (error) {
        return <div className="song-list-manager">Lỗi: {error}</div>;
    }

    // Nếu không loading, không lỗi, nhưng không tìm thấy playlist
    if (!playlist) {
        // Lỗi "Không tìm thấy playlist" đã được set ở trên, nên phần này có thể không cần
        // Hoặc bạn có thể hiển thị một thông báo khác ở đây nếu muốn
        return <div className="song-list-manager">Không tìm thấy thông tin playlist.</div>;
    }

    // 6. Render danh sách bài hát khi có dữ liệu
    return (
        <div className="song-list-manager">
            {/* Có thể thêm tiêu đề playlist ở đây nếu muốn */}
            {/* <h2>{playlist.title}</h2> */}
            {playlist.tracks.length === 0 ? (
                 <div>Playlist này chưa có bài hát nào.</div>
            ) : (
                 playlist.tracks.map((song, index) => (
                    <div
                        key={song.id || index} // Ưu tiên dùng song.id
                        className="song-item-manager"
                        onClick={() => handleClick(index)} // Gọi hàm xử lý click
                    >
                        <div className="song-number">{index + 1}</div>
                        <img
                             src={song.cover}
                             alt={song.title}
                             className="rec-song-image"
                             onError={(e) => (e.currentTarget.src = '/assets/default_track_cover.png')} // Fallback ảnh lỗi
                        />
                        <div className="rec-song-info">
                            <div className="rec-song-title">{song.title}</div>
                            <div className="rec-song-artist">{song.artist}</div>
                        </div>
                    </div>
                 ))
            )}
        </div>
    );
};

export default DataPlaylist;
