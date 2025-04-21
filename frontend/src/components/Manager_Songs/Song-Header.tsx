import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface Song {
  title: string;
  artist: string;
  cover: string;
  src: string;
}

const SongHeader: React.FC = () => {
  const location = useLocation();
  const { currentSong }: { currentSong?: Song } = location.state || {};

  useEffect(() => {
    if (currentSong?.src) {
      localStorage.setItem("currentSong", currentSong.src);
      window.dispatchEvent(new Event("storage")); // Thông báo cho Controls
    }
  }, [currentSong]);

  if (!currentSong) {
    return <div>Không tìm thấy thông tin bài hát.</div>;
  }

  return (
    <div className="song-header">
      <img src={currentSong.cover} alt={currentSong.title} className="song-image" />
      <div className="song-details">
        <div className="song-type">Bài hát</div>
        <h1 className="song-title-track">{currentSong.title}</h1>
        <div className="song-meta">
          <img src={currentSong.cover} alt={currentSong.artist} className="artist-image" />
          <span>{currentSong.artist}</span>
          <span className="dot-separator">•</span>
          <span>{currentSong.title}</span>
          <span className="dot-separator">•</span>
          <span>2023</span>
          <span className="dot-separator">•</span>
          <span>4:40</span>
          <span className="dot-separator">•</span>
          <span>1,344,940</span>
        </div>
      </div>
    </div>
  );
};

export default SongHeader;
