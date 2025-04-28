import React, { useEffect, useState } from "react"; // Import useState, useEffect
import { useParams } from "react-router-dom";
// 1. Import hàm API lấy chi tiết playlist theo ID
import { getPlaylistByIdAPI } from "../../services/playlistService";

// 2. Định nghĩa hoặc import kiểu dữ liệu (giữ nguyên nếu đã có)
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
    artist: string; // Artist của người tạo playlist
    timeAgo: string;
    cover: string;
    tracks: TrackItem[];
}

const PlaylistHeader: React.FC = () => {
    const { playlistId } = useParams<{ playlistId: string }>();

    // 3. Thêm state cho playlist, loading, error
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 4. useEffect để fetch dữ liệu khi playlistId thay đổi
    useEffect(() => {
        if (!playlistId) {
            setError("ID Playlist không hợp lệ.");
            setIsLoading(false);
            return;
        }
        const numericId = Number(playlistId);
        if (isNaN(numericId)) {
            setError("ID Playlist không phải là số hợp lệ.");
            setIsLoading(false);
            return;
        }

        const fetchPlaylistHeaderData = async () => {
            setIsLoading(true);
            setError(null);
            setPlaylist(null); // Reset

            try {
                console.log(`PlaylistHeader: Calling getPlaylistByIdAPI for ID: ${numericId}`);
                // Gọi API
                const fetchedPlaylist = await getPlaylistByIdAPI(numericId);

                if (fetchedPlaylist) {
                    setPlaylist(fetchedPlaylist); // Cập nhật state
                    console.log("PlaylistHeader: Playlist data fetched successfully.");
                } else {
                    setError("Không tìm thấy playlist.");
                    console.log(`PlaylistHeader: Playlist with ID ${numericId} not found.`);
                }
            } catch (err: any) {
                console.error(`PlaylistHeader: Failed to fetch playlist details for ID ${numericId}:`, err);
                setError("Không thể tải thông tin playlist.");
            } finally {
                setIsLoading(false); // Kết thúc loading
            }
        };

        fetchPlaylistHeaderData();

    }, [playlistId]); // Chạy lại khi playlistId thay đổi

    // 5. Render có điều kiện
    if (isLoading) {
        // Có thể hiển thị một skeleton loader thay vì chỉ text
        return <div className="playlist-header loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="playlist-header error">Lỗi: {error}</div>;
    }

    // Nếu không loading, không lỗi, nhưng không tìm thấy playlist
    if (!playlist) {
        return <div className="playlist-header not-found">Không tìm thấy thông tin playlist.</div>;
    }

    // 6. Render header khi có dữ liệu
    return (
        <div className="playlist-header">
            {/* Ảnh bìa lớn của playlist */}
            <img
                src={playlist.cover}
                alt={playlist.title}
                className="playlist-image"
                onError={(e) => (e.currentTarget.src = '/assets/default_playlist_cover.png')}
            />
            <div className="playlist-details">
                <div className="playlist-type">Playlist</div>
                {/* Tiêu đề playlist */}
                <h1 className="playlist-title">{playlist.title}</h1>
                {/* Thông tin meta: người tạo, thời gian, số lượng bài hát */}
                <div className="playlist-meta">
                    {/* Ảnh nhỏ của người tạo (có thể dùng ảnh mặc định hoặc ảnh user nếu API trả về) */}
                    <img
                         src={playlist.cover} // Tạm dùng ảnh playlist, nên dùng ảnh user nếu có
                         alt={playlist.artist}
                         className="artist-image"
                         onError={(e) => (e.currentTarget.src = '/assets/default_user_avatar.png')} // Fallback avatar
                     />
                    {/* Tên người tạo playlist */}
                    <span>{playlist.artist}</span>
                    <span className="dot-separator">•</span>
                    {/* Thời gian tạo playlist */}
                    <span>{playlist.timeAgo}</span>
                    <span className="dot-separator">•</span>
                    {/* Số lượng bài hát */}
                    <span>{playlist.tracks.length} tracks</span>
                </div>
            </div>
        </div>
    );
};

export default PlaylistHeader;
