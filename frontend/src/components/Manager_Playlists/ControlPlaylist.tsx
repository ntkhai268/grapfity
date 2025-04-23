import React, { useState } from "react";
import useSongManager from "../../hooks/Manager_Song_Play";
import EditPlaylistForm from "../../components/Manager_Playlists/Edit_Playlist_Form"

interface ISongManagerOutput {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  songUrl: string | undefined;
  isPlaying: boolean;
  togglePlay: () => void;
}

const ControlPlaylist: React.FC = () => {
  const { audioRef, songUrl, isPlaying, togglePlay }: ISongManagerOutput = useSongManager();
  const [isEditing, setIsEditing] = useState(false); // popup state

  return (
    <>
      <div className="controls controls-playlist">
        <audio ref={audioRef} src={songUrl} />

        {/* Nút Play hình tròn màu xanh */}
        <button className="play-button-circle" onClick={togglePlay}>
          <i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i>
        </button>

        {/* Các nút chức năng khác */}
        <div className="control-buttons">
          <button className="control-button" title="Like Playlist">
            <i className="fas fa-heart"></i>
          </button>
          <button className="control-button" title="Add All to Queue">
            <i className="fas fa-plus"></i>
          </button>
          <button
            className="control-button"
            title="Edit Playlist"
            onClick={() => setIsEditing(true)}
          >
            <i className="fas fa-pen"></i>
          </button>
          <button className="control-button" title="Delete Playlist">
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      {/* Popup Form */}
      {isEditing && (
        <div className="popup-backdrop">
          <div className="popup-content">
            <EditPlaylistForm onCancel={() => setIsEditing(false)} />
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
