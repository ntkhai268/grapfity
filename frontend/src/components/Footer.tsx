import React from "react";
import useFooterAudioPlayer from "../hooks/FooterAudioPlayer";
import "../styles/Footer.css";

interface Song {
  cover?: string;
  title: string;
  artist: string;
}

interface FooterLeftProps {
  song: Song;
}

const FooterLeft: React.FC<FooterLeftProps> = ({ song }) => {
  return (
    <div className="footer-left">
      <div className="playing-song">
        <img src={song.cover || "assets/anhmau.png"} alt={song.title} />
      </div>
      <div className="title-playing-song">
        <p className="song-title">{song.title}</p>
        <p className="song-artist">{song.artist}</p>
      </div>
      <button className="btn-DC">
        <img src="assets/plus.png" alt="Add" />
      </button>
    </div>
  );
};

interface MusicControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
}

const MusicControls: React.FC<MusicControlsProps> = ({
  isPlaying,
  togglePlay,
  nextSong,
  prevSong,
}) => {
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

interface ProgressBarProps {
  currentTime: string;
  totalTime: string;
  progress: number;
  onSeek: (percent: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  totalTime,
  progress,
  onSeek,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    onSeek(percent);
  };

  return (
    <div className="progress-container">
      <span className="current-time">{currentTime}</span>
      <div className="progress-bar" onClick={handleClick}>
        <div className="current-progress" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="total-time">{totalTime}</span>
    </div>
  );
};

const Footer: React.FC = () => {
  const {
    song,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    currentTime,
    duration,
    seekTo,
  } = useFooterAudioPlayer();

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (percent: number) => {
    const newTime = percent * duration;
    seekTo(newTime);
  };

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
          <button className="btn-DC">
            <img src="assets/plus.png" alt="Add" />
          </button>
        </div>

        <div className="music-player">
          <MusicControls
            isPlaying={false}
            togglePlay={() => {}}
            nextSong={() => {}}
            prevSong={() => {}}
          />
          <ProgressBar currentTime="0:00" totalTime="0:00" progress={0} onSeek={() => {}} />
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <FooterLeft song={song as Song} />
      <div className="music-player">
        <MusicControls
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          nextSong={nextSong}
          prevSong={prevSong}
        />
        <ProgressBar
          currentTime={formatTime(currentTime)}
          totalTime={formatTime(duration)}
          progress={progress}
          onSeek={handleSeek}
        />
      </div>
    </footer>
  );
};

export default Footer;
