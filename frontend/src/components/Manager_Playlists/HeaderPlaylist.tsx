import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// 1. Import đầy đủ các hàm API cần thiết
import { getPlaylistByIdAPI, updatePlaylistAPI, uploadPlaylistImageAPI } from "../../services/playlistService";
// Import component Modal chỉnh sửa
import PlaylistEditModal from './PlaylistEditModal';
// Import kiểu dữ liệu
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
    timeAgo: string;
    cover: string | null;
    tracks: TrackItem[];
}

// SVG Paths
const svgIconMusicNote = "M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z";
const svgIconEdit = "M17.318 1.975a3.329 3.329 0 1 1 4.707 4.707L8.451 20.256c-.49.49-1.082.867-1.735 1.103L2.34 22.94a1 1 0 0 1-1.28-1.28l1.581-4.376a4.726 4.726 0 0 1 1.103-1.735L17.318 1.975zm3.293 1.414a1.329 1.329 0 0 0-1.88 0L5.159 16.963c-.283.283-.5.624-.636 1l-.857 2.372 2.371-.857a2.726 2.726 0 0 0 1.001-.636L20.611 5.268a1.329 1.329 0 0 0 0-1.879z";


const PlaylistHeader: React.FC = () => {
    const { playlistId } = useParams<{ playlistId: string }>();
    const navigate = useNavigate(); // Import nếu cần dùng navigate sau khi lưu

    // States
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [isHoveringDefaultIcon, setIsHoveringDefaultIcon] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Thêm state cho trạng thái đang lưu

    // Hàm fetch dữ liệu playlist
    const fetchPlaylistHeaderData = async () => {
        if (!playlistId) { setError("ID Playlist không hợp lệ."); setIsLoading(false); return; }
        const numericId = Number(playlistId);
        if (isNaN(numericId)) { setError("ID Playlist không phải là số hợp lệ."); setIsLoading(false); return; }
        setIsLoading(true); setError(null); setImageError(false);
        try {
            const fetchedPlaylist = await getPlaylistByIdAPI(numericId);
            if (fetchedPlaylist) { setPlaylist(fetchedPlaylist); }
            else { setError("Không tìm thấy playlist."); setPlaylist(null); }
        } catch (err: any) { setError("Không thể tải thông tin playlist."); setPlaylist(null); }
        finally { setIsLoading(false); }
    };
    useEffect(() => { fetchPlaylistHeaderData(); }, [playlistId]);

    // Hàm xử lý lỗi ảnh
    const handleImageError = () => { setImageError(true); };

    // Hàm mở/đóng modal
    const handleOpenEditModal = () => { if (!isLoading && playlist) { setShowEditModal(true); } };
    const handleCloseEditModal = () => { setShowEditModal(false); };

    // --- HÀM XỬ LÝ LƯU THAY ĐỔI (ĐÃ TÍCH HỢP UPLOAD) ---
    const handleSaveChanges = async (playlistIdToSave: number, newTitle: string, newImageFile?: File) => {
        console.log("PlaylistHeader: Saving changes...", { playlistIdToSave, newTitle, newImageFile });
        setIsSaving(true); // Bắt đầu trạng thái đang lưu

        let finalImageUrl: string | null = playlist?.cover ?? null; // Giữ ảnh cũ mặc định

        // ---- XỬ LÝ UPLOAD ẢNH NẾU CÓ FILE MỚI ----
        if (newImageFile) {
            console.log("PlaylistHeader: Uploading new image...");
            try {
                // 2. Gọi API upload ảnh đã import
                const uploadedImageUrl = await uploadPlaylistImageAPI(newImageFile);

                if (uploadedImageUrl) {
                    finalImageUrl = uploadedImageUrl; // 3. Lấy URL ảnh mới thành công
                    console.log("PlaylistHeader: Image uploaded successfully:", finalImageUrl);
                } else {
                    // Trường hợp API upload không trả về URL hợp lệ
                    throw new Error("API upload không trả về URL ảnh.");
                }
            } catch (uploadError: any) {
                console.error("PlaylistHeader: Image upload failed:", uploadError);
                alert(`Lỗi tải ảnh lên: ${uploadError.message || 'Vui lòng thử lại.'}`);
                setIsSaving(false); // Kết thúc trạng thái đang lưu
                // Không đóng modal ngay nếu upload lỗi
                return; // Dừng lại nếu upload lỗi
            }
        }
        // -------------------------------------------

        // ---- Gọi API cập nhật Playlist ----
        // Chỉ gọi nếu title hoặc ảnh thực sự thay đổi
        if (newTitle !== playlist?.title || finalImageUrl !== playlist?.cover) {
            console.log("PlaylistHeader: Calling updatePlaylistAPI...");
            try {
                // 4. Gọi API cập nhật với title và URL ảnh cuối cùng
                const updatedPlaylist = await updatePlaylistAPI(playlistIdToSave, newTitle, finalImageUrl); // Truyền finalImageUrl (có thể là null)

                if (updatedPlaylist) {
                    console.log("Playlist updated successfully in API:", updatedPlaylist);
                    setPlaylist(updatedPlaylist); // Cập nhật state của header
                    alert("Cập nhật playlist thành công!");
                } else {
                    alert("Cập nhật playlist thất bại (phản hồi không hợp lệ).");
                }
            } catch (updateError: any) {
                console.error("Error updating playlist:", updateError);
                alert(`Đã xảy ra lỗi khi cập nhật playlist: ${updateError.message || 'Vui lòng thử lại.'}`);
                setIsSaving(false); // Kết thúc trạng thái đang lưu
                return; // Dừng lại
            }
        } else {
             console.log("No changes to save.");
        }

        setIsSaving(false); // Kết thúc trạng thái đang lưu
        handleCloseEditModal(); // Luôn đóng modal sau khi xử lý thành công hoặc không có gì thay đổi
    };


    // Render có điều kiện (giữ nguyên)
    if (isLoading) return <div className="playlist-header loading">Đang tải...</div>;
    if (error) return <div className="playlist-header error">Lỗi: {error}</div>;
    if (!playlist) return <div className="playlist-header not-found">Không tìm thấy thông tin playlist.</div>;

    // Render header
    return (
        <> {/* Sử dụng Fragment */}
            <div className="playlist-header">
                <div
                    className="playlist-image-container"
                    onClick={handleOpenEditModal}
                    title="Chỉnh sửa thông tin chi tiết"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setIsHoveringDefaultIcon(true)}
                    onMouseLeave={() => setIsHoveringDefaultIcon(false)}
                 >
                    {playlist.cover && !imageError ? (
                        <img src={playlist.cover} alt={playlist.title} className="playlist-image" onError={handleImageError} />
                    ) : (
                        <div className="playlist-image default-icon-container">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#b3b3b3" width="80" height="80">
                                <path d={isHoveringDefaultIcon ? svgIconEdit : svgIconMusicNote}></path>
                            </svg>
                        </div>
                    )}
                </div>

                <div className="playlist-details">
                    <div className="playlist-type">Playlist</div>
                    <h1 className="playlist-title" onClick={handleOpenEditModal} style={{ cursor: 'pointer' }} title="Chỉnh sửa thông tin chi tiết">
                        {playlist.title}
                    </h1>
                    <div className="playlist-meta">
                        <img src={"/assets/default_user_avatar.png"} alt={playlist.artist} className="artist-image" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        <span>{playlist.artist}</span>
                        <span className="dot-separator">•</span>
                        <span>{playlist.timeAgo}</span>
                        <span className="dot-separator">•</span>
                        <span>{playlist.tracks.length} tracks</span>
                    </div>
                </div>
            </div>

            {/* Render Modal */}
            {showEditModal && (
                <PlaylistEditModal
                    playlist={playlist}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveChanges} // Truyền hàm đã cập nhật
                    // isSaving={isSaving} // Truyền trạng thái đang lưu vào modal (tùy chọn)
                />
            )}
        </>
    );
};

export default PlaylistHeader;
