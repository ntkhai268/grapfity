import React, { useState} from "react";
import ControlPlaylist from "./Manager_Playlists/ControlPlaylist";
import PlaylistHeader from "./Manager_Playlists/HeaderPlaylist";
import DataPlaylist from "./Manager_Playlists/DataPlaylist";
import { getPlaylists } from "../components/Manager_Playlists/ManagerDataPlaylist";

import "../styles/ManagerSongLayout.css";

interface ManagerPlaylistSectionProps {
  playlistId: number;
}

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
  const [bgColor, setBgColor] = useState("#7D3218");

  const playlists = getPlaylists();
  const playlist = playlists.find((pl: PlaylistData) => pl.id === playlistId);

  if (!playlist) {
    return <div>Không tìm thấy playlist với id {playlistId}</div>;
  }
  

  return (
    <div className="container">
      <div className="song_side_playlist"
         style={{
          background: `linear-gradient(to bottom, ${bgColor}, var(--spotify-black) 70%)`,
        }}
      >
        <div
          className="Management_playlist"
        >
          <PlaylistHeader onColorExtract={setBgColor} />
          <ControlPlaylist />
          <DataPlaylist />
        </div>
      </div>
    </div>
  );
};

export default ManagerPlaylistSection;
