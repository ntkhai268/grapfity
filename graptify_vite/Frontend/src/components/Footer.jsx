import React from "react";
import useFooterAudioPlayer from "../js/FooterAudioPlayer";

const FooterLeft = ({ song }) => {
  return (
    <div className="footer-left">
      <div className="playing-song">
        <img src={song.cover || "assets/anhmau.png"} alt={song.title} />
      </div>
      <div className="title-playing-song">
        <p className="song-title">{song.title}</p>
        <p className="song-artist">{song.artist}</p>
      </div>
    </div>
  );
};

const MusicControls = ({ isPlaying, togglePlay, nextSong, prevSong }) => {
  return (
    <div className="music-controls">
      <button className="shuffle">
        <img src="assets/shuffle.png" alt="Shuffle" />
      </button>
      <button className="prev" onClick={prevSong}>
        <img src="assets/prev.png" alt="Previous" />
      </button>
      <button className="play-pause" onClick={togglePlay}>
        <img src={isPlaying ? "assets/stop.png" : "assets/play.png"} alt="Play/Pause" />
      </button>
      <button className="next" onClick={nextSong}>
        <img src="assets/next.png" alt="Next" />
      </button>
      <button className="repeat">
        <img src="assets/loop.png" alt="Repeat" />
      </button>
    </div>
  );
};

const ProgressBar = ({ currentTime, totalTime }) => {
  return (
    <div className="progress-container">
      <span className="current-time">{currentTime}</span>
      <div className="progress-bar">
        <div className="current-progress" style={{ width: "50%" }}></div>
      </div>
      <span className="total-time">{totalTime}</span>
    </div>
  );
};

const FooterRight = () => {
  return (
    <div className="footer-right">
      <button className="btn-DC">
        <img src="assets/plus.png" alt="Add" />
      </button>
    </div>
  );
};

const Footer = () => {
  const {
    song,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong
  } = useFooterAudioPlayer();

  if (!song) {
    return (
      <footer className="footer">
        <div className="footer-left">
          <div className="playing-song">
            <img src="assets/anhmau.png" alt="default" />
          </div>
          <div className="title-playing-song">
            <p className="song-title">Chưa chọn bài hát</p>
            <p className="song-artist">—</p>
          </div>
        </div>
        <FooterRight />
        <div className="music-player">
          <MusicControls
            isPlaying={false}
            togglePlay={() => {}}
            nextSong={() => {}}
            prevSong={() => {}}
          />
          <ProgressBar currentTime="0:00" totalTime="0:00" />
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <FooterLeft song={song} />
      <FooterRight />
      <div className="music-player">
        <MusicControls
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          nextSong={nextSong}
          prevSong={prevSong}
        />
        <ProgressBar currentTime="0:00" totalTime="4:39" />
      </div>
    </footer>
  );
};

export default Footer;
