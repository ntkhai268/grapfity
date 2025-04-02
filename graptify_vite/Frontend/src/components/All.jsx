import React from "react";

const songs = [
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
];

const SongList = () => {
  return (
    <div className="content all active">
      {songs.map((song, index) => (
        <div key={index} className="song" data-src={song.src}>
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
