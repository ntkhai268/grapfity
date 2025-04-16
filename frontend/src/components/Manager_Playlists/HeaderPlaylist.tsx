import React from "react";
import { useParams } from "react-router-dom";
import { playlists } from "../../components/Manager_Playlists/ManagerDataPlaylist";

const PlaylistHeader: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const numericId = Number(playlistId);
  const playlist = playlists.find((pl) => pl.id === numericId);

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
