import React, { useEffect } from "react";
import { initWaveSurfer } from "../../hooks/WaveForm";

interface Song {
  src: string;
  title: string;
  artist: string;
}

const songs: Song[] = [
  {
    src: "assets/CoDangDeYeuThuong-DucAnhDuUyen-35764062.mp3",
    title: "Có Đáng Để Yêu Thương",
    artist: "Đức Anh, Du Uyên",
  },
  {
    src: "assets/Bánh Mì Không.mp3",
    title: "Bánh Mì Không",
    artist: "Đạt G, Du Uyên",
  },
  {
    src: "assets/BacPhanRapVersion-TuiHat-6184759.mp3",
    title: "Bạc Phận",
    artist: "K-ICM, Jack",
  },
  {
    src: "assets/MotDemSay.mp3",
    title: "Một Đêm Say",
    artist: "Thịnh Suy"
  },
  {
    src:"assets/CaoOc20.mp3",
    title: "Cao Ốc 20",
    artist: "Bray, Đạt G"
  },
  {
    src: "assets/PhiaSauMotCoGai.mp3",
    title: "Phía Sau Một Cô Gái",
    artist: "SOOBIN"
  },
];

interface SongListProps {}

const SongList: React.FC<SongListProps> = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      initWaveSurfer(); // Khởi tạo WaveSurfer chỉ khi tab này được render
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="content all active">
      {songs.map((song, index) => (
        <div
          key={index}
          className="song"
          data-src={song.src}
          data-title={song.title}
          data-artist={song.artist}
          data-cover="assets/anhmau.png"
        >
          <div className="song_left">
            <img src="assets/anhmau.png" alt="Album Cover" className="album_cover" />
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