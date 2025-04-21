import React from "react";
import { useParams } from "react-router-dom";
import { getPlaylists } from "../../components/Manager_Playlists/ManagerDataPlaylist";

// Định nghĩa kiểu PlaylistData (nếu chưa có)
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

const PlaylistHeader: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const numericId = Number(playlistId);

  // Lấy danh sách playlists từ getPlaylists
  const playlists = getPlaylists();
  
  // Tìm playlist theo id
  const playlist = playlists.find((pl: PlaylistData) => pl.id === numericId);

  if (!playlist) {
    return <div>Không tìm thấy thông tin playlist.</div>;
  }

  return (
    <div className="playlist-header">
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
