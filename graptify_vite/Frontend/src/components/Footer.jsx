import React from "react";

const FooterLeft = ({ song }) => {
  return (
    <div className="footer-left">
      <div className="playing-song">
        <img src={song.cover} alt={song.title} />
      </div>
      <div className="title-playing-song">
        <p className="song-title">{song.title}</p>
        <p className="song-artist">{song.artist}</p>
      </div>
    </div>
  );
};

const MusicControls = ({ isPlaying, togglePlay }) => {
  return (
    <div className="music-controls">
      <button className="shuffle">
        <img src="assets/shuffle.png" alt="Shuffle" />
      </button>
      <button className="prev">
        <img src="assets/prev.png" alt="Previous" />
      </button>
      <button className="play-pause" onClick={togglePlay}>
        <img src={isPlaying ? "assets/stop.png" : "assets/play.png"} alt="Play/Pause" />
      </button>
      <button className="next">
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
  const song = {
    title: "Nỗi Đau Đính Kèm",
    artist: "Anh Tú Atus, RHYDER",
    cover: "assets/anhmau.png",
  };

  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <footer className="footer">
      <FooterLeft song={song} />
      <FooterRight />
      <div className="music-player">
        <MusicControls isPlaying={isPlaying} togglePlay={togglePlay} />
        <ProgressBar currentTime="2:14" totalTime="4:39" />
      </div>
    </footer>
  );
};

export default Footer;
