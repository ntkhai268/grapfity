import React, { useState } from "react";
import useSongManager from "../../hooks/Manager_Song_Play";
import EditPlaylistForm from "../../components/Manager_Playlists/Edit_Playlist_Form";
// --- 1. Import hàm deletePlaylistAPI ---
// !!! Đảm bảo đường dẫn này đúng với vị trí file service của bạn !!!
import { deletePlaylistAPI } from "../../services/playlistService"; // Hoặc tên file service tương ứng

interface ISongManagerOutput {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  songUrl: string | undefined;
  isPlaying: boolean;
  togglePlay: () => void;
}

// --- 2. Sửa props cho component ---
interface ControlPlaylistProps {
  playlistId: string | number; // <-- Sửa: Chỉ chấp nhận string hoặc number, không chấp nhận undefined/null
  onDeleteSuccess?: () => void; // Hàm callback để xử lý khi xóa thành công (tùy chọn)
}

const ControlPlaylist: React.FC<ControlPlaylistProps> = ({ playlistId, onDeleteSuccess }) => { // <-- Nhận props
  const { audioRef, songUrl, isPlaying, togglePlay }: ISongManagerOutput = useSongManager();
  const [isEditing, setIsEditing] = useState(false); // popup state
  const [isDeleting, setIsDeleting] = useState(false); // Trạng thái đang xóa (để vô hiệu hóa nút)
  const [deleteError, setDeleteError] = useState<string | null>(null); // Lưu trữ lỗi xóa

  // --- 3. Hàm xử lý xóa playlist ---
  const handleDeletePlaylist = async () => {
    // --- XÓA KIỂM TRA KHÔNG CẦN THIẾT ---
    // Prop playlistId giờ đây được đảm bảo là string hoặc number theo kiểu dữ liệu
    // Không cần kiểm tra !playlistId nữa
    // ---------------------------------

    // --- 4. Hỏi xác nhận ---
    if (!window.confirm(`Bạn có chắc chắn muốn xóa playlist này không? Hành động này không thể hoàn tác.`)) {
      return; // Người dùng hủy
    }

    setIsDeleting(true); // Bắt đầu xóa, vô hiệu hóa nút
    setDeleteError(null); // Xóa lỗi cũ

    try {
      // --- 5. Gọi API xóa ---
      // playlistId giờ đây chắc chắn là string hoặc number
      await deletePlaylistAPI(playlistId);

      // --- 6. Xử lý thành công ---
      alert("Đã xóa playlist thành công!"); // Thông báo đơn giản
      // Gọi callback nếu có để component cha xử lý (ví dụ: điều hướng, làm mới danh sách)
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

    } catch (error: any) {
      // --- 7. Xử lý lỗi ---
      console.error("Lỗi khi xóa playlist:", error);
      // Lấy message lỗi từ Error object (hàm API đã ném ra)
      const errorMessage = error.message || "Đã xảy ra lỗi không xác định khi xóa playlist.";
      setDeleteError(errorMessage); // Lưu lỗi để hiển thị (nếu muốn)
      alert(`Lỗi khi xóa playlist: ${errorMessage}`); // Hiển thị lỗi cho người dùng

    } finally {
      setIsDeleting(false); // Kết thúc xóa, kích hoạt lại nút
    }
  };

  return (
    <>
      <div className="controls controls-playlist">
        <audio ref={audioRef} src={songUrl} />

        {/* Nút Play hình tròn màu xanh */}
        <button className="play-button-circle" onClick={togglePlay} disabled={isDeleting}>
          <i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i>
        </button>

        {/* Các nút chức năng khác */}
        <div className="control-buttons">
          <button className="control-button" title="Like Playlist" disabled={isDeleting}>
            <i className="fas fa-heart"></i>
          </button>
          <button className="control-button" title="Add All to Queue" disabled={isDeleting}>
            <i className="fas fa-plus"></i>
          </button>
          <button
            className="control-button"
            title="Edit Playlist"
            onClick={() => setIsEditing(true)}
            disabled={isDeleting} // Chỉ cần kiểm tra isDeleting vì playlistId luôn hợp lệ
          >
            <i className="fas fa-pen"></i>
          </button>
          {/* --- 8. Gắn handler vào nút xóa --- */}
          <button
            className="control-button"
            title="Delete Playlist"
            onClick={handleDeletePlaylist} // Gọi hàm xử lý khi nhấn
            disabled={isDeleting} // Chỉ cần kiểm tra isDeleting vì playlistId luôn hợp lệ
          >
            {/* Hiển thị icon loading nếu đang xóa (tùy chọn) */}
            {isDeleting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash-alt"></i>}
          </button>
        </div>
        {/* Hiển thị thông báo lỗi (tùy chọn) */}
        {deleteError && <p style={{ color: 'red', marginTop: '10px' }}>{deleteError}</p>}
      </div>

      {/* Popup Form */}
      {isEditing && (
        <div className="popup-backdrop">
          <div className="popup-content">
            {/* Cần truyền playlistId vào EditPlaylistForm nếu nó cần */}
            <EditPlaylistForm onCancel={() => setIsEditing(false)} /* playlistId={playlistId} */ />
            <button className="popup-close-btn" onClick={() => setIsEditing(false)}>
              &times;
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default ControlPlaylist;
