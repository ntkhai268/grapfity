import React from "react";

const PopularSongs = () => {
  const songs = [
    {
      number: 1,
      image: "assets/anhmau.png",
      title: "Bạc Phận",
      stats: "2,767,771",
      duration: "4:09"
    },
    {
      number: 2,
      image: "assets/anhmau.png",
      title: "Sao Em Vô Tình",
      stats: "2,261,921",
      duration: "5:35"
    },
    {
      number: 3,
      image: "assets/anhmau.png",
      title: "Ai Mang Cô Đơn Đi",
      stats: "3,863,396",
      duration: "3:41"
    }
  ];

  return (
    <div className="popular-songs">
      <h2>Các bản nhạc thịnh hành của</h2>
      <h2>ICM</h2>
      <div className="song-list">
        {songs.map((song, index) => (
          <div className="song-item" key={index}>
            <div className="song-number">{song.number}</div>
            <img src={song.image} alt={song.title} className="rec-song-image" />
            <div className="rec-song-info">
              <div className="rec-song-title">{song.title}</div>
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
