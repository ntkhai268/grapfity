import React from "react";
import { usePlayer } from "../context/PlayerContext";

import bacphan from "../assets/BacPhanRapVersion-TuiHat-6184759.mp3";
import banhmikhong from "../assets/Bánh Mì Không.mp3";
import codangdeyeuthuong from "../assets/CoDangDeYeuThuong-DucAnhDuUyen-35764062.mp3";

import img1 from "../assets/bacphan.jpg";
import img2 from "../assets/banhmikhong.jpg";
import img3 from "../assets/anhmau.png";

import "../styles/ProfileSection.css";

const likedTracks = [
  {
    id: 1,
    title: "Bạc Phận",
    artist: "Jack",
    image: img1,
    audio: bacphan,
    plays: 1000,
    likes: 2000,
    shares: 3000,
  },
  {
    id: 2,
    title: "Bánh Mì Không",
    artist: "Đạt G",
    image: img2,
    audio: banhmikhong,
    plays: 800,
    likes: 1200,
    shares: 900,
  },
];

const recentTracks = [
  {
    id: 1,
    title: "Có Đáng Để Yêu Thương",
    artist: "Đức Anh, Du Uyên",
    image: img3,
    audio: codangdeyeuthuong,
  },
  {
    id: 2,
    title: "Bánh Mì Không",
    artist: "Đạt G",
    image: img2,
    audio: banhmikhong,
  },
  {
    id: 3,
    title: "Bạc Phận",
    artist: "Jack",
    image: img1,
    audio: bacphan,
  },
];

const ProfileSection = () => {
  const { setPlaylist, setCurrentIndex } = usePlayer();

  const handleClick = (list: any[], index: number) => {
    setPlaylist(list);
    setCurrentIndex(index);
  };

  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="avatar" />
        <div className="info">
          <p className="label">Hồ Sơ</p>
          <h2>Hưng Nguyễn</h2>
        </div>
      </div>

      <div className="profile-tabs">
        <span className="tab active">All</span>
        <span className="tab">Popular tracks</span>
        <span className="tab">Tracks</span>
        <span className="tab">Playlist</span>
      </div>

      <div className="profile-stats">
        <div>Follower <strong>0</strong></div>
        <div>Following <strong>3</strong></div>
        <div>Tracks <strong>5</strong></div>
      </div>

      <div className="profile-content">
        <div className="recent-tracks">
          <p className="section-title">Recent</p>
          {recentTracks.map((track, index) => (
            <div
              className="track"
              key={track.id}
              onClick={() => handleClick(recentTracks, index)}
            >
              <img src={track.image} alt="track" />
              <div className="meta">
                <strong>{track.title}</strong>
                <p>{track.artist}</p>
              </div>
              <img src="/assets/waveform.png" className="waveform" />
            </div>
          ))}
        </div>

        <div className="liked-tracks">
          <div className="liked-header">
            <p>{likedTracks.length} Likes</p>
            <a href="#">View all</a>
          </div>
          {likedTracks.map((track, index) => (
            <div
              className="liked-track"
              key={track.id}
              onClick={() => handleClick(likedTracks, index)}
            >
              <img src={track.image} alt="track" />
              <div className="meta">
                <strong>{track.title}</strong>
                <p>{track.artist}</p>
              </div>
              <div className="stats">
                <span>▶ {track.plays}</span>
                <span>❤️ {track.likes}</span>
                <span>🔁 {track.shares}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
