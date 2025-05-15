import { useEffect, useState, useCallback, useRef } from "react"; // Import thêm useRef
import * as React from 'react';

import { useParams } from "react-router-dom";
// 1. Import các hàm API cần thiết
// import { getPlaylistByIdAPI } from "../../services/playlistService";
import {getTracksInPlaylistAPI, removeTrackFromPlaylistAPI } from "../../services/trackPlaylistService"
import GlobalAudioManager, { Song } from "../../hooks/GlobalAudioManager";

// 2. Import hoặc định nghĩa lại kiểu dữ liệu
interface TrackItem {
    id: number | string;
    title: string;
    src: string;
    artist?: string;
    cover?: string;
}
interface PlaylistData {
    id: number | string;
    title: string;
    artist?: string;
    timeAgo?: string;
    cover?: string;
    tracks: TrackItem[];
}

const DataPlaylist: React.FC = () => {
    const { playlistId } = useParams<{ playlistId: string }>();

    // --- State ---
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | number | null>(null);

    // --- Refs ---
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- Hàm Fetch Dữ Liệu ---
    const fetchPlaylistDetails = useCallback(async () => {
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
        setIsLoading(true);
        setError(null);
        try {
            const fetchedPlaylist = await getTracksInPlaylistAPI(numericId);
            if (fetchedPlaylist) {
                setPlaylist(fetchedPlaylist);
            } else {
                setError("Không tìm thấy playlist.");
                setPlaylist(null);
            }
        } catch (err: any) {
            setError("Không thể tải chi tiết playlist. Vui lòng thử lại.");
            setPlaylist(null);
        } finally {
            setIsLoading(false);
        }
    }, [playlistId]);

    // --- Effect để fetch dữ liệu ---
    useEffect(() => {
        fetchPlaylistDetails();
    }, [fetchPlaylistDetails]);

    // --- Handlers ---
    const handlePlaySong = useCallback((index: number) => {
        if (!playlist || !playlist.tracks || !playlist.tracks[index]) return;
        const songsForManager: Song[] = playlist.tracks.map(track => ({
            id: track.id,
            src: track.src,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
        }));
        GlobalAudioManager.setPlaylist(songsForManager, index, {id: playlist.id,type: 'playlist'});
        GlobalAudioManager.playSongAt(index);
    }, [playlist]);

    // Mở/đóng dropdown
    const toggleTrackDropdown = (event: React.MouseEvent, index: number) => {
        event.stopPropagation();
        setOpenDropdownIndex(prevIndex => (prevIndex === index ? null : index));
    };

    // Xử lý xóa track
    const handleDeleteTrack = useCallback(async (trackId: string | number) => {
        if (!playlistId || isDeleting === trackId) return;
        setIsDeleting(trackId);
        setOpenDropdownIndex(null); // Đóng dropdown ngay khi bắt đầu xóa
        try {
            const numericPlaylistId = Number(playlistId);
            if (isNaN(numericPlaylistId)) throw new Error("Playlist ID không hợp lệ.");
            const result = await removeTrackFromPlaylistAPI(numericPlaylistId, trackId);
            if (result.success) {
                alert(result.message || "Đã xóa bài hát."); // Feedback tạm
                fetchPlaylistDetails(); // Refresh list
            } else {
                alert(result.message || "Xóa thất bại."); // Feedback tạm
            }
        } catch (error: any) {
            alert(error.message || "Lỗi khi xóa."); // Feedback tạm
        } finally {
            setIsDeleting(null);
        }
    }, [playlistId, fetchPlaylistDetails, isDeleting]);

    // --- Effect để xử lý click outside dropdown ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Chỉ cần kiểm tra click ra ngoài dropdown menu là đủ
            if (openDropdownIndex !== null && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Xóa các dòng khai báo biến không dùng đến:
                // const optionsElement = (event.target as Element).closest('.song-item-options');
                // const clickedItemIndex = optionsElement ? Array.from(optionsElement.parentElement?.children ?? []).indexOf(optionsElement.parentElement as Element) : -1; // <<< XÓA
                // const itemIndex = Array.from(dropdownRef.current.closest('.song-item-manager')?.parentElement?.children ?? []).indexOf(dropdownRef.current.closest('.song-item-manager') as Element); // <<< XÓA

                 setOpenDropdownIndex(null); // Đóng dropdown
            }
        };

        // Thêm/Xóa listener
        if (openDropdownIndex !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownIndex]); // Phụ thuộc vào state mở/đóng dropdown

    // --- Render Logic ---
    if (isLoading && !playlist) {
        return <div className="song-list-manager">Đang tải chi tiết playlist...</div>;
    }
    if (error && !playlist) {
        return <div className="song-list-manager">Lỗi: {error}</div>;
    }
    if (!playlist) {
        return <div className="song-list-manager">Không tìm thấy thông tin playlist.</div>;
    }

    return (
        <div className="song-list-manager">
            <h2>{playlist.title}</h2>
            {isLoading && <div>Đang cập nhật...</div>}
            {error && !isLoading && <div style={{ color: 'red' }}>Lỗi cập nhật: {error}</div>}

            {playlist.tracks.length === 0 ? (
                <div>Playlist này chưa có bài hát nào.</div>
            ) : (
                playlist.tracks.map((song, index) => (
                    <div
                        key={song.id || index}
                        className="song-item-manager"
                        onClick={() => handlePlaySong(index)}
                    >
                        <div className="song-number">{index + 1}</div>
                        <img
                            src={song.cover}
                            alt={song.title}
                            className="rec-song-image"
                            onError={(e) => (e.currentTarget.src = '/assets/default_track_cover.png')}
                        />
                        <div className="rec-song-info">
                            <div className="rec-song-title">{song.title}</div>
                            <div className="rec-song-artist">{song.artist || 'Unknown Artist'}</div>
                        </div>

                        {/* --- Icon Ellipsis và Dropdown --- */}
                        <div
                            className="song-item-options"
                            onClick={(e) => toggleTrackDropdown(e, index)}
                        >
                            <i className="fas fa-ellipsis-h"></i>

                            {/* Dropdown Menu */}
                            {openDropdownIndex === index && (
                                <div
                                    className="dropdown-menu"
                                    ref={dropdownRef} // Gắn ref
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className={`dropdown-menu-item ${isDeleting === song.id ? 'disabled' : ''}`}
                                        onClick={() => handleDeleteTrack(song.id)}
                                    >
                                        {isDeleting === song.id ? 'Đang xóa...' : 'Xóa khỏi playlist'}
                                    </div>
                                    {/* Thêm các mục khác nếu cần */}
                                </div>
                            )}
                        </div>
                        {/* --- Kết thúc Icon Ellipsis và Dropdown --- */}
                    </div>
                ))
            )}
        </div>
    );
};

export default DataPlaylist;
