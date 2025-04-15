// import React from "react";
import React, { useEffect } from "react";

import { initializeWaveSurfer } from "../js/playlist.js";
const playlists = [
  {
    title: "MUSICAS PARA CHURRASCO 🔥",
    artist: "Funk Trapstar",
    timeAgo: "11 months ago",
    tracks: [
      { title: "Em Gì Ơi (Jack)", src: "assets/EmGiOi.mp3", plays: "5,140" },
      { title: "Hồng Nhan (K-ICM, Jack)", src: "assets/HongNhan.mp3", plays: "3,301" },
      { title: "Sóng Gió (K-ICM)", src: "assets/SongGio.mp3", plays: "14.6K" },
      { title: "Lạc Trôi (Sơn Tùng M-TP)", src: "assets/LacTroi.mp3", plays: "1,974" },
      { title: "Cô Thắm Không Về (Chưa Xác Định)", src: "assets/CoThamKhongVe.mp3", plays: "64.8K" },
      { title: "Bạc Phận (version rap)", src: "assets/BacPhanRapVersion-TuiHat-6184759.mp3", plays: "32.4K" },
      { title: "Bánh Mì Không (Du Uyên, Đạt G)", src: "assets/Bánh Mì Không.mp3", plays: "9,874" }
    ]
  },
  {
    title: "MUSICAS PARA CHURRASCO 🔥",
    artist: "Funk Trapstar",
    timeAgo: "11 months ago",
    tracks: [
      { title: "Sự Nghiệp Chướng (Pháo)", src: "assets/SuNghiepChuong.mp3", plays: "5,140" }
    ]
  },
  {
    title: "MUSICAS PARA CHURRASCO 🔥",
    artist: "Funk Trapstar",
    timeAgo: "11 months ago",
    tracks: [
      { title: "Mạnh Bà (Linh Hương Luz)", src: "assets/ManhBa.mp3", plays: "5,140" },
      { title: "Sự Nghiệp Chướng (Pháo)", src: "assets/SuNghiepChuong.mp3", plays: "5,140" }
    ]
  }
];

const Playlist = () => {
    useEffect(() => {
        initializeWaveSurfer(); // Gọi khi component mount
      }, []);
  return (
    <div className="content playlist">
      {playlists.map((playlist, index) => (
        <div className="player-container" key={index}>
          <div className="track-info">
            <div className="album-art">
              <div className="purple-rectangle"></div>
            </div>
            <div className="track-details">
              <div className="artist-info">
                <span className="artist-name">{playlist.artist}</span>
                <span className="time-ago">{playlist.timeAgo}</span>
              </div>
              <h2 className="track-title">{playlist.title}</h2>
              <div className="waveform">
                <div className="audio-playlist"></div>
              </div>
              
              <div className="track-list">
              {playlist.tracks.map((track, i) => (
                <div
                  className="track-item"
                  data-src={track.src}
                  data-title={track.title}
                  data-artist={playlist.artist}
                  data-cover="assets/anhmau.png" // hoặc dùng track.cover nếu bạn có thông tin ảnh riêng cho từng bài
                  key={i}
                >
                  <div className="track-number">{i + 1}</div>
                  <div className="track-content">
                    <div className="track-text">
                      <span>{track.title}</span>
                    </div>
                    <div className="track-plays">
                      <i className="fas fa-play"></i>
                      <span>{track.plays}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="view-more">
                <span>View 22 tracks</span>
              </div>
            </div>

            </div>
          </div>
          <div className="action-buttons">
            <button className="btn-like"><i className="far fa-heart"></i> 12</button>
            <button className="btn-repost"><i className="fas fa-retweet"></i> 1</button>
            <button className="btn-share"><i className="fas fa-share-alt"></i> Share</button>
            <button className="btn-copy-link"><i className="fas fa-link"></i> Copy Link</button>
            <button className="btn-next-up"><i className="fas fa-list"></i> Add to Next up</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Playlist;
