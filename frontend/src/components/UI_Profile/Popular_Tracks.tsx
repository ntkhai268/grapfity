import React from "react";
// import { initWaveSurfer } from "../js/waveform";

interface PopularTrack {
  src: string;
  title: string;
  artist: string;
}

const popularTracks: PopularTrack[] = [
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

interface PopularTracksProps {}

const PopularTracks: React.FC<PopularTracksProps> = () => {
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     initWaveSurfer(); // Khởi tạo WaveSurfer chỉ khi tab này được render
  //   }, 300);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div className="content popular">
      {popularTracks.map((track, index) => (
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

export default PopularTracks;