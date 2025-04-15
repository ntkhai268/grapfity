import React, { useEffect } from "react";
// import { initWaveSurfer } from "../js/waveform";

interface Track {
  src: string;
  title: string;
  artist: string;
}

const tracks: Track[] = [
  {
    src: "assets/LacTroi.mp3",
    title: "Lạc Trôi",
    artist: "Sơn Tùng M-TP",
  },
];

interface TracksProps {}

const Tracks: React.FC<TracksProps> = () => {
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     initWaveSurfer(); // Khởi tạo WaveSurfer chỉ khi tab này được render
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div className="content track">
      {tracks.map((track, index) => (
        <div
          key={index}
          className="song"
          data-src={track.src}
          data-title={track.title}
          data-artist={track.artist}
          data-cover="assets/anhmau.png"
        >
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

export default Tracks;