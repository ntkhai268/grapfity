import React from "react";

const popularTracks = [
  {
    src: "assets/BacPhanRapVersion-TuiHat-6184759.mp3",
    title: "Bạc Phận",
    artist: "K-ICM, Jack",
  },
];

const PopularTracks = () => {
  return (
    <div className="content popular">
      {popularTracks.map((track, index) => (
        <div key={index} className="song" data-src={track.src}>
          <div className="song_left">
            <img src="assets/anhmau.png" alt="Album Cover" className="album_cover" />
            <button className="play_button">
              <img src="assets/play.png" alt="Play" />
            </button>
          </div>
          <div className="song_info">
            <p className="song_title">{track.title}</p>
            <p className="artist">{track.artist}</p>
            <div className="audio"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularTracks;