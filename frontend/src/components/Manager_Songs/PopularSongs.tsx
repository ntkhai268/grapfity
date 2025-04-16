import React from "react";
import { useNavigate } from "react-router-dom";
import GlobalAudioManager from "../../hooks/GlobalAudioManager";

interface ISong {
  id: number;
  src: string;
  number: number;
  cover: string;
  title: string;
  artist: string;
  stats: string;
  duration: string;
}

const PopularSongs: React.FC = () => {
  const navigate = useNavigate();

  const songs: ISong[] = [
    {
      id: 1,
      src: "/assets/BacPhanRapVersion-TuiHat-6184759.mp3",
      number: 1,
      cover: "/assets/anhmau.png",
      title: "Bạc Phận",
      artist: "K-ICM, Jack",
      stats: "2,767,771",
      duration: "4:09"
    },
    {
      id: 2,
      src: "/assets/CoThamKhongVe.mp3",
      number: 2,
      cover: "/assets/anhmau.png",
      title: "Cô Thắm Không Về",
      artist: "NoName",
      stats: "2,261,921",
      duration: "5:35"
    },
    {
      id: 3,
      src: "assets/CaoOc20.mp3",
      number: 3,
      cover: "assets/anhmau.png",
      title: "Cao Ốc 20",
      artist: "Bray, Dạt G",
      stats: "3,863,396",
      duration: "3:41"
    }
  ];

  const handleClick = (index: number) => {
    const song = songs[index];

    // ✅ Phát nhạc qua GlobalAudioManager
    GlobalAudioManager.setPlaylist(songs, index);
    GlobalAudioManager.playSongAt(index);

    // ✅ Điều hướng đến trang ManagerSong nếu cần
    console.log("Navigating to /ManagerSong...");
    navigate("/ManagerSong", {
      state: {
        songs,
        currentIndex: index,
        currentSong: song,
      },
    });
  };

  return (
    <div className="popular-songs">
      <h2>Các bản nhạc thịnh hành của</h2>
      <h2>ICM</h2>
      <div className="song-list-manager">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="song-item-manager"
            onClick={() => handleClick(index)}
          >
            <div className="song-number">{song.number}</div>
            <img src={song.cover} alt={song.title} className="rec-song-image" />
            <div className="rec-song-info">
              <div className="rec-song-title">{song.title}</div>
              <div className="rec-song-artist">{song.artist}</div>
            </div>
            <div className="song-stats">{song.stats}</div>
            <div className="song-duration">{song.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularSongs;
