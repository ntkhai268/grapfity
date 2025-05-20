import React from "react";

interface Track {
  title: string;
  artist: string;
  src: string;
  cover: string;
}

const tracks: Track[] = [
  {
    title: "Lạc Trôi",
    artist: "Sơn Tùng M-TP",
    src: "assets/LacTroi.mp3",
    cover: "/assets/anhmau.png",
  },
];

const Tracks: React.FC = () => {
  return (
    <div className="content track">
      {tracks.map((track, index) => (
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

export default Tracks;
