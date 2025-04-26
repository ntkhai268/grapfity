import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar'; 

import GlobalAudioManager from "../hooks/GlobalAudioManager";
import bacphan from "../assets/audio/BacPhanRapVersion-TuiHat-6184759.mp3";
import banhmikhong from "../assets/audio/Bánh Mì Không.mp3";
import codangdeyeuthuong from "../assets/audio/CoDangDeYeuThuong-DucAnhDuUyen-35764062.mp3";
import img1 from "../assets/images/bacphan.jpg";
import img2 from "../assets/images/banhmikhong.jpg";
import img3 from "../assets/images/anhmau.png";
import "../styles/Section.css";

/* Danh sách recommended */
const songs = [
  {
    id: 1,
    title: "Bạc phận",
    artist: "Jack",
    cover: img1,
    src: bacphan,
  },
  {
    id: 2,
    title: "Bánh mì không",
    artist: "Đạt G",
    cover: img2,
    src: banhmikhong,
  },
  {
    id: 3,
    title: "Có đáng để yêu thương",
    artist: "Du Uyên",
    cover: img3,
    src: codangdeyeuthuong,
  },
  {
    id: 4,
    title: "Quá Lâu",
    artist: "Vinh Khuất",
    cover: "/assets/qualau.png",
    src: "/assets/QuaLau.mp3",
  },
];

/* Danh sách recently released */
const songs_released = [
  {
    id: 5,
    title: "Tháng Năm",
    artist: "Soobin",
    cover: img1,
    src: "/assets/ThangNam.mp3",
  },
  {
    id: 6,
    title: "Waiting For You",
    artist: "Mono",
    cover: img2,
    src: "/assets/WaitingForYou.mp3",
  },
  {
    id: 7,
    title: "Sau Lưng Anh Có Ai Kìa",
    artist: "Thiều Bảo Trâm",
    cover: img3,
    src: "/assets/SauLungAiKia.mp3",
  },
];

/* Danh sách popular albums and singles */
const songs_popular = [
  {
    id: 8,
    title: "Chạy Ngay Đi",
    artist: "Sơn Tùng M-TP",
    cover: img1,
    src: "/assets/ChayNgayDi.mp3",
  },
  {
    id: 9,
    title: "Muộn Rồi Mà Sao Còn",
    artist: "Sơn Tùng M-TP",
    cover: img1,
    src: "/assets/MuonRoiMaSaoCon.mp3",
  },
  {
    id: 10,
    title: "Anh Đã Quen Với Cô Đơn",
    artist: "Soobin Hoàng Sơn",
    cover: img1,
    src: "/assets/AnhDaQuenVoiCoDon.mp3",
  },
];

const Section = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleSidebarExpandChange = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  const handleClick = (list: any[], index: number) => {
    const song = list[index];
    GlobalAudioManager.setPlaylist(list, index);
    GlobalAudioManager.playSongAt(index);
    navigate("/ManagerSong", {
      state: {
        songs: list,
        currentIndex: index,
        currentSong: song,
      },
    });
  };

  return (
    <>
      <Sidebar onExpandChange={handleSidebarExpandChange} />
      <section className={`song_side ${sidebarExpanded ? "shrink" : ""}`}>
        <h1>Recommended for today</h1>
        <div className="song-list">
          {songs.map((song, index) => (
            <button key={song.id} className="song-item" onClick={() => handleClick(songs, index)}>
              <img src={song.cover} alt={song.title} />
              <p className="title">{song.title}</p>
              <p className="artist">{song.artist}</p>
            </button>
          ))}
        </div>

        <h1>Recently released</h1>
<div className="song-list song-list-circle">
  {songs_released.map((song, index) => (
    <button key={song.id} className="song-item" onClick={() => handleClick(songs_released, index)}>
      <img src={song.cover} alt={song.title} />

    </button>
  ))}
</div>


        <h1>Popular albums and singles</h1>
        <div className="song-list">
          {songs_popular.map((song, index) => (
            <button key={song.id} className="song-item" onClick={() => handleClick(songs_popular, index)}>
              <img src={song.cover} alt={song.title} />
              <p className="title">{song.title}</p>
              <p className="artist">{song.artist}</p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
};

export default Section;
