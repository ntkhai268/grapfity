import React, { useEffect } from "react";
import { initWaveSurfer } from "../../hooks/WaveForm";

interface Song {
  id: number;
  src: string;
  cover: string;
  title: string;
  artist: string;
}

const songs: Song[] = [
  {
    id: 1,
    src: "assets/CoDangDeYeuThuong-DucAnhDuUyen-35764062.mp3",
    cover: "assets/anhmau.png",
    title: "Có Đáng Để Yêu Thương",
    artist: "Đức Anh, Du Uyên",
  },
  {
    id: 2,
    src: "assets/Bánh Mì Không.mp3",
    cover: "assets/anhmau.png",
    title: "Bánh Mì Không",
    artist: "Đạt G, Du Uyên",
  },
  {
    id: 3,
    src: "assets/BacPhanRapVersion-TuiHat-6184759.mp3",
    cover: "assets/anhmau.png",
    title: "Bạc Phận",
    artist: "K-ICM, Jack",
  },
  {
    id: 4,
    src: "assets/MotDemSay.mp3",
    cover: "assets/anhmau.png",
    title: "Một Đêm Say",
    artist: "Thịnh Suy",
  },
  {
    id: 5,
    src: "assets/CaoOc20.mp3",
    cover: "assets/anhmau.png",
    title: "Cao Ốc 20",
    artist: "Bray, Đạt G",
  },
  {
    id: 6,
    src: "assets/PhiaSauMotCoGai.mp3",
    cover: "assets/anhmau.png",
    title: "Phía Sau Một Cô Gái",
    artist: "SOOBIN",
  },
];

const SongList: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      initWaveSurfer();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="content all active">
      {songs.map((song) => (
        <div
          key={song.id}
          className="song"
          data-src={song.src}
          data-title={song.title}
          data-artist={song.artist}
          data-cover={song.cover}
        >
          <div className="song_left">
            <img src={song.cover} alt="Album Cover" className="album_cover" />
            <button className="play_button">
              <img src="assets/play.png" alt="Play" />
            </button>
          </div>
          <div className="song_info">
            <p className="song_title">{song.title}</p>
            <p className="artist">{song.artist}</p>
            <div className="audio"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongList;
