// D:\web_html\gop\grapfity\frontend\src\components\Manager_Playlists\HeaderPlaylist.tsx
import React, { useEffect, useState} from "react";
import { useParams,useNavigate } from "react-router-dom";
// 1. Import hàm API lấy chi tiết và cập nhật playlist (ĐÃ XÓA uploadPlaylistImageAPI)
import { updatePlaylistAPI, uploadPlaylistImageAPI } from "../../services/playlistService";
import {getTracksInPlaylistAPI} from "../../services/trackPlaylistService"
// Import component Modal chỉnh sửa
import PlaylistEditModal from './PlaylistEditModal';
// Import hook lấy màu
import useImageColor from '../../hooks/useImageColor';


// Import kiểu dữ liệu
interface TrackItem {
    id: number | string;
    title: string;
    src: string;
    artist: string;
    uploaderId?: number; 
    cover: string | null;
    imageUrl?: string | null;
    
}
interface PlaylistData {
    id: number;
    title: string;
    artist: string;
    uploaderId?: number; 
    timeAgo: string;
    cover: string | null;
    imageUrl?: string | null;
    tracks: TrackItem[];
    privacy?: 'public' | 'private'; 
}


interface PlaylistHeaderProps {
    onColorExtract?: (color: string) => void;
}

// SVG Paths
const svgIconMusicNote = "M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z";
const svgIconEdit = "M17.318 1.975a3.329 3.329 0 1 1 4.707 4.707L8.451 20.256c-.49.49-1.082.867-1.735 1.103L2.34 22.94a1 1 0 0 1-1.28-1.28l1.581-4.376a4.726 4.726 0 0 1 1.103-1.735L17.318 1.975zm3.293 1.414a1.329 1.329 0 0 0-1.88 0L5.159 16.963c-.283.283-.5.624-.636 1l-.857 2.372 2.371-.857a2.726 2.726 0 0 0 1.001-.636L20.611 5.268a1.329 1.329 0 0 0 0-1.879z";

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ onColorExtract }) => {
    const { playlistId } = useParams<{ playlistId: string }>();
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [isHoveringDefaultIcon, setIsHoveringDefaultIcon] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
    // State cho cache busting
    const [imageVersion, setImageVersion] = useState(Date.now());

    // Xác định URL tương đối và URL đầy đủ cho ảnh bìa (dùng cho hook màu)
    const relativeCoverUrlForColor = playlist?.cover ?? playlist?.imageUrl ?? null;
    // Tạo URL đầy đủ, thêm version để hook lấy màu cũng cập nhật khi ảnh đổi
    const fullCoverUrlForColor = relativeCoverUrlForColor
        ? `${relativeCoverUrlForColor}?v=${imageVersion}`
        : null;

    // Hook lấy màu nền từ ảnh bìa
    const bgColor = useImageColor(fullCoverUrlForColor);
    const navigate = useNavigate();

    // Fetch dữ liệu playlist khi component mount hoặc ID thay đổi
    useEffect(() => {
        const fetchPlaylistData = async () => {
            if (!playlistId) { setError("ID Playlist không hợp lệ."); setIsLoading(false); return; }
            const numericId = Number(playlistId);
            if (isNaN(numericId)) { setError("ID Playlist không phải là số hợp lệ."); setIsLoading(false); return; }

            setIsLoading(true); setError(null); setImageError(false);
            try {
                const fetchedPlaylist = await getTracksInPlaylistAPI(numericId);
                if (fetchedPlaylist) {
                    setPlaylist(fetchedPlaylist as PlaylistData);
                    setImageVersion(Date.now()); // Cập nhật version khi fetch dữ liệu mới
                } else {
                    setError("Không tìm thấy playlist."); setPlaylist(null);
                }
            } catch (err: any) {
                setError("Không thể tải thông tin playlist."); setPlaylist(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlaylistData();
    }, [playlistId]);

    // Gửi màu nền lên component cha khi màu thay đổi
    useEffect(() => {
        if (bgColor && onColorExtract) { onColorExtract(bgColor); }
    }, [bgColor, onColorExtract]);

    // Xử lý lỗi khi tải ảnh bìa
    const handleImageError = () => { setImageError(true); };

    // Mở modal chỉnh sửa
    const handleOpenEditModal = () => {
        if (!isLoading && playlist) {
            setPendingImageUrl(null); // Reset ảnh chờ khi mở modal
            setShowEditModal(true);
        }
    };

    // Đóng modal chỉnh sửa
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setPendingImageUrl(null); // Reset ảnh chờ khi đóng modal
    };

    // Xử lý lưu thay đổi từ modal
    const handleSaveChanges = async (
  playlistIdToSave: number,
  newTitle: string,
  newImageFile?: File,
  newPrivacy?: 'public' | 'private'
) => {
  if (!playlist) return;

  const trimmedNewTitle = newTitle.trim();
  if (trimmedNewTitle === '') {
    alert("Lỗi: Tiêu đề playlist không được để trống.");
    return;
  }

  const currentTitle = playlist.title ?? '';
  const currentRelativeImageUrlFromState = playlist.cover ?? playlist.imageUrl ?? null;
  const currentPrivacy = playlist.privacy ?? 'public';

  let finalRelativeImageUrl = currentRelativeImageUrlFromState;
  let didUploadOccurThisTime = false;

  const titleHasChanged = trimmedNewTitle !== currentTitle;
  const hasNewImageFile = !!newImageFile;
  const privacyHasChanged = newPrivacy !== undefined && newPrivacy !== currentPrivacy;

  // Nếu có ảnh pending (đã chọn thay đổi nhưng chưa upload) thì ưu tiên dùng ảnh đó
  if (pendingImageUrl && pendingImageUrl !== currentRelativeImageUrlFromState) {
    finalRelativeImageUrl = pendingImageUrl;
  }

  if (!titleHasChanged && !hasNewImageFile && !pendingImageUrl && !privacyHasChanged) {
    console.log("PlaylistHeader: No changes detected.");
    handleCloseEditModal();
    return;
  }

  setIsSaving(true);

  try {
    // Upload ảnh mới nếu có
    if (hasNewImageFile && newImageFile) {
      try {
        const uploadedRelativeImageUrl = await uploadPlaylistImageAPI(playlistIdToSave, newImageFile);
        finalRelativeImageUrl = uploadedRelativeImageUrl;
        didUploadOccurThisTime = true;
        setPendingImageUrl(null);
      } catch (uploadError: any) {
        alert(`Lỗi khi tải ảnh lên: ${uploadError.message || 'Vui lòng thử lại.'}`);
        setIsSaving(false);
        return;
      }
    }

    const effectiveImageUrlHasChanged = finalRelativeImageUrl !== currentRelativeImageUrlFromState;

    // Nếu không có thay đổi thực sự thì đóng modal
    if (!titleHasChanged && !effectiveImageUrlHasChanged && !privacyHasChanged) {
      console.log("PlaylistHeader: No effective changes after processing image. Closing modal.");
      handleCloseEditModal();
      setIsSaving(false);
      return;
    }

    // Chuẩn bị dữ liệu cập nhật dưới dạng object, tránh truyền null ảnh không cần thiết
    const updateData: {
      title: string;
      imageUrl?: string | null;
      privacy?: 'public' | 'private';
    } = {
      title: trimmedNewTitle,
      privacy: newPrivacy || currentPrivacy,
    };

    if (effectiveImageUrlHasChanged) {
      updateData.imageUrl = finalRelativeImageUrl;
    }

    // Gọi API cập nhật truyền 1 object duy nhất
    const updatedPlaylistData = await updatePlaylistAPI(playlistIdToSave, updateData);

    if (updatedPlaylistData) {
      setPlaylist(updatedPlaylistData as PlaylistData);
      setPendingImageUrl(null);
      setImageVersion(Date.now());
      alert("Cập nhật playlist thành công!");
      handleCloseEditModal();
    } else {
      alert("Cập nhật playlist thất bại (phản hồi không hợp lệ).");
      if (didUploadOccurThisTime) setPendingImageUrl(finalRelativeImageUrl);
    }
  } catch (updateError: any) {
    alert(`Đã xảy ra lỗi khi cập nhật playlist: ${updateError.message || 'Vui lòng thử lại.'}`);
    if (didUploadOccurThisTime) setPendingImageUrl(finalRelativeImageUrl);
  } finally {
    setIsSaving(false);
  }
};


    // Render UI
    if (isLoading) return <div className="playlist-header loading">Đang tải...</div>;
    if (error) return <div className="playlist-header error">Lỗi: {error}</div>;
    if (!playlist) return <div className="playlist-header not-found">Không tìm thấy thông tin playlist.</div>;

    // Xác định URL ảnh bìa đầy đủ để hiển thị
    const relativeCoverUrlToDisplay = pendingImageUrl ?? playlist.cover ?? playlist.imageUrl ?? null;
    // Tạo URL đầy đủ từ URL tương đối đã xác định, THÊM THAM SỐ VERSION
    const coverUrlToDisplay = relativeCoverUrlToDisplay
        ? `${relativeCoverUrlForColor}?v=${imageVersion}` // <-- Thêm ?v=...
        : null;
    console.log('Playlist passed to modal:', playlist);
    return (
        <>
            <div className="playlist-header">
                <div
                    className="playlist-image-container"
                    onClick={handleOpenEditModal}
                    title="Chỉnh sửa thông tin chi tiết"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setIsHoveringDefaultIcon(true)}
                    onMouseLeave={() => setIsHoveringDefaultIcon(false)}
                 >
                    {/* Sử dụng coverUrlToDisplay đã xác định */}
                    {coverUrlToDisplay && !imageError ? (
                        // --- THÊM KEY PROP VÀO IMG ---
                        <img
                            key={coverUrlToDisplay} // <-- Thêm key bằng chính URL (đã có version)
                            src={coverUrlToDisplay}
                            alt={playlist.title}
                            className="playlist-image"
                            onError={handleImageError} />
                        // ---------------------------
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
                        <img src={"/assets/default_user_avatar.png"} alt={playlist.artist || 'Nghệ sĩ'} className="artist-image" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        <span
                            style={{ cursor: "pointer", color: "#1DB954", fontWeight: 500 }}
                            onClick={() => {
                            if (playlist.uploaderId) {
                                navigate(`/profile/${playlist.uploaderId}`);
                            }
                            }}
                        >
                            {playlist.artist}
                        </span>
                        <span className="dot-separator">•</span>
                        <span>{playlist.timeAgo || ''}</span>
                        <span className="dot-separator">•</span>
                        <span>{Array.isArray(playlist.tracks) ? playlist.tracks.length : 0} tracks</span>
                    </div>
                </div>
            </div>

            {/* Render Modal */}
            {showEditModal && (
                <PlaylistEditModal
                    // Truyền dữ liệu playlist hiện tại, dùng URL tương đối để modal hiển thị đúng ảnh ban đầu
                    playlist={playlist ? { ...playlist, cover:  `${relativeCoverUrlToDisplay}?`, privacy: playlist.privacy || 'public' } : null}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveChanges}
                    isSaving={isSaving}
                />
            )}
        </>
    );
};

export default PlaylistHeader;
