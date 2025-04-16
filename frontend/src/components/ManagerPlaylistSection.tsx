import React from "react";
import ControlPlaylist from "./Manager_Playlists/ControlPlaylist";
import PlaylistHeader from "./Manager_Playlists/HeaderPlaylist";
import DataPlaylist from "./Manager_Playlists/DataPlaylist";
import { playlists } from "../components/Manager_Playlists/ManagerDataPlaylist";

import "../styles/ManagerSongLayout.css";

// ✅ Đảm bảo định nghĩa prop type đúng
interface ManagerPlaylistSectionProps {
  playlistId: number;
}

const ManagerPlaylistSection: React.FC<ManagerPlaylistSectionProps> = ({ playlistId }) => {
  const playlist = playlists.find((pl) => pl.id === playlistId);

  if (!playlist) {
    return <div>Không tìm thấy playlist với id {playlistId}</div>;
  }

  return (
    <div className="container">
      <div className="song_side_playlist">
        <div className="Management_playlist">
          <PlaylistHeader />
          <ControlPlaylist />
          <DataPlaylist />
        </div>
      </div>
    </div>
  );
};

export default ManagerPlaylistSection;
