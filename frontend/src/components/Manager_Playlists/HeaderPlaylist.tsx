import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPlaylists } from "../../components/Manager_Playlists/ManagerDataPlaylist";
import useImageColor from "../../hooks/useImageColor";

interface TrackItem {
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
  cover: string;
  tracks: TrackItem[];
}

interface PlaylistHeaderProps {
  onColorExtract?: (color: string) => void;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ onColorExtract }) => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const numericId = Number(playlistId);
  const playlists = getPlaylists();
  const playlist = playlists.find((pl: PlaylistData) => pl.id === numericId);

  const bgColor = useImageColor(playlist?.cover || null);
  console.log("Màu từ ảnh:", bgColor);

  useEffect(() => {
    if (bgColor && onColorExtract) {
      onColorExtract(bgColor);
    }
  }, [bgColor, onColorExtract]);

  if (!playlist) {
    return <div>Không tìm thấy thông tin playlist.</div>;
  }

  return (
    <div className="playlist-header" style={{ backgroundColor: bgColor }}>
      <img src={playlist.cover} alt={playlist.title} className="playlist-image" />
      <div className="playlist-details">
        <div className="playlist-type">Playlist</div>
        <h1 className="playlist-title">{playlist.title}</h1>
        <div className="playlist-meta">
          <img src={playlist.cover} alt={playlist.artist} className="artist-image" />
          <span>{playlist.artist}</span>
          <span className="dot-separator">•</span>
          <span>{playlist.timeAgo}</span>
          <span className="dot-separator">•</span>
          <span>{playlist.tracks.length} tracks</span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
