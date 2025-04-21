import React from "react";
import ControlPlaylist from "./Manager_Playlists/ControlPlaylist";
import PlaylistHeader from "./Manager_Playlists/HeaderPlaylist";
import DataPlaylist from "./Manager_Playlists/DataPlaylist";
import { getPlaylists } from "../components/Manager_Playlists/ManagerDataPlaylist"; // Sửa từ playlists thành getPlaylists

import "../styles/ManagerSongLayout.css";

// ✅ Đảm bảo định nghĩa prop type đúng
interface ManagerPlaylistSectionProps {
  playlistId: number;
}

// Định nghĩa kiểu PlaylistData nếu chưa có
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

const ManagerPlaylistSection: React.FC<ManagerPlaylistSectionProps> = ({ playlistId }) => {
  // Lấy danh sách playlists từ getPlaylists
  const playlists = getPlaylists();
  
  // Tìm playlist theo id
  const playlist = playlists.find((pl: PlaylistData) => pl.id === playlistId);

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
