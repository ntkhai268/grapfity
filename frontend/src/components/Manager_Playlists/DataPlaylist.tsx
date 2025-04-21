import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlaylists } from "../../components/Manager_Playlists/ManagerDataPlaylist"; // Import hàm getPlaylists
import GlobalAudioManager from "../../hooks/GlobalAudioManager";

const DataPlaylist: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const numericId = Number(playlistId);

  // Lấy danh sách playlists từ getPlaylists
  const playlists = getPlaylists();
  
  // Tìm playlist theo ID
  const playlist = playlists.find((pl) => pl.id === numericId);

  if (!playlist) {
    return <div>Không tìm thấy playlist.</div>;
  }

  const handleClick = (index: number) => {
    const song = playlist.tracks[index];

    // ✅ Set playlist và play qua GlobalAudioManager
    GlobalAudioManager.setPlaylist(playlist.tracks, index);
    GlobalAudioManager.playSongAt(index);

    // ✅ Nếu muốn chuyển đến trang phát chi tiết
    navigate("/ManagerSong", {
      state: {
        songs: playlist.tracks,
        currentIndex: index,
        currentSong: song,
      },
    });
  };

  return (
    <div className="song-list-manager">
      {playlist.tracks.map((song, index) => (
        <div
          key={index}
          className="song-item-manager"
          onClick={() => handleClick(index)}
        >
          <div className="song-number">{index + 1}</div>
          <img src={song.cover} alt={song.title} className="rec-song-image" />
          <div className="rec-song-info">
            <div className="rec-song-title">{song.title}</div>
            <div className="rec-song-artist">{song.artist}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataPlaylist;
