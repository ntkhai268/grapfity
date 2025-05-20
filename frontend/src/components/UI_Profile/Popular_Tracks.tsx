import React from "react";

interface PopularTrack {
  title: string;
  artist: string;
  src: string;
  cover: string;
}

const popularTracks: PopularTrack[] = [
  {
    title: "Bánh Mì Không",
    artist: "Đạt G, Du Uyên",
    src: "assets/Bánh Mì Không.mp3",
    cover: "/assets/anhmau.png",
  },
  {
    title: "Bạc Phận",
    artist: "K-ICM, Jack",
    src: "assets/BacPhanRapVersion-TuiHat-6184759.mp3",
    cover: "/assets/anhmau.png",
  },
];

const PopularTracks: React.FC = () => {
  return (
    <div className="content popular">
      {popularTracks.map((track, index) => (
        <div
          key={index}
          className="song"
          data-src={track.src}
          data-title={track.title}
          data-artist={track.artist}
          data-cover={track.cover}
        >
          <div className="song_left">
            <img src={track.cover} alt="Album Cover" className="album_cover" />
            <button className="play_button">
              <img src="/assets/play.png" alt="Play" />
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
