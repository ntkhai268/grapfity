import React, { useState } from "react";
import useSongManager from "../../hooks/Manager_Song_Play";

import { deletePlaylistAPI } from "../../services/playlistService";
import GlobalAudioManager, { Song } from "../../hooks/GlobalAudioManager";

interface ISongManagerOutput {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  songUrl: string | undefined;
  isPlaying: boolean;
  togglePlay: () => void;
}

interface ControlPlaylistProps {
  playlistId: string | number;
  tracks: Song[];
  onDeleteSuccess?: () => void;
}

const ControlPlaylist: React.FC<ControlPlaylistProps> = ({ playlistId, tracks, onDeleteSuccess }) => {
  const { audioRef, songUrl, isPlaying, togglePlay }: ISongManagerOutput = useSongManager();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Xử lý xóa playlist
  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa playlist này không? Hành động này không thể hoàn tác.`)) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deletePlaylistAPI(playlistId);
      alert("Đã xóa playlist thành công!");
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.message || "Đã xảy ra lỗi không xác định khi xóa playlist.";
      setDeleteError(errorMessage);
      alert(`Lỗi khi xóa playlist: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Hàm xử lý khi nhấn nút play
  const handlePlay = () => {
    const currentSong = GlobalAudioManager.getCurrentSong();
    const isSamePlaylist = GlobalAudioManager.getCurrentContext()?.id === playlistId;

    if (!currentSong || !isSamePlaylist) {
      // Nếu chưa phát hoặc context khác, set playlist rồi play từ đầu
      GlobalAudioManager.setPlaylist(tracks, 0, { id: playlistId, type: 'playlist' });
      GlobalAudioManager.playSongAt(0);
    } else {
      // Đúng playlist, chỉ toggle play/pause
      togglePlay();
    }
  };

  return (
    <>
      <div className="controls controls-playlist">
        <audio ref={audioRef} src={songUrl} />

        {/* Nút Play hình tròn màu xanh */}
        <button
          className="play-button-circle"
          onClick={handlePlay}
          disabled={isDeleting}
        >
          <i className={isPlaying && GlobalAudioManager.getCurrentContext()?.id === playlistId
            ? "fas fa-pause"
            : "fas fa-play"}>
          </i>
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
            title="Delete Playlist"
            onClick={handleDeletePlaylist}
            disabled={isDeleting}
          >
            {isDeleting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash-alt"></i>}
          </button>
        </div>

        {/* Hiển thị thông báo lỗi (nếu có) */}
        {deleteError && <p style={{ color: 'red', marginTop: '10px' }}>{deleteError}</p>}
      </div>

      
    </>
  );
};

export default ControlPlaylist;
