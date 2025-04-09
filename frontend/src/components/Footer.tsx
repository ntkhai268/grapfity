// src/components/Footer.tsx
import { useEffect, useRef, useState, ChangeEvent } from "react";
import { usePlayer } from "../context/PlayerContext";
import "../styles/Footer.css";

// Icons
import shuffleIcon from "../assets/shuffle.png";
import prevIcon from "../assets/prev.png";
import playIcon from "../assets/play.png";
import pauseIcon from "../assets/stop.png";
import nextIcon from "../assets/next.png";
import repeatIcon from "../assets/loop.png";
import plusIcon from "../assets/plus.png";

const Footer = () => {
  const { playlist, currentIndex, currentSong, setCurrentIndex } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      audio.load();
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Audio play error", err));
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    setCurrentTime(currentTime);
    setDuration(duration);
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : playlist.length - 1));
  };

  const handleShuffle = () => {
    const random = Math.floor(Math.random() * playlist.length);
    setCurrentIndex(random);
  };

  const handleRepeat = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <footer className="footer">
      <div className="left-info">
        {currentSong && (
          <>
            <img src={currentSong.image} alt={currentSong.title} className="footer-img" />
            <div>
              <p className="footer-title">{currentSong.title}</p>
              <p className="footer-artist">{currentSong.artist}</p>
            </div>
            <button className="icon-button">
              <img src={plusIcon} alt="Add" className="icon-small" />
            </button>
          </>
        )}
      </div>

      <div className="center-controls">
        <div className="control-icons">
          <img src={shuffleIcon} alt="Shuffle" onClick={handleShuffle} />
          <img src={prevIcon} alt="Previous" onClick={handlePrevious} />
          <button onClick={togglePlay} className="play-button">
            <img src={isPlaying ? pauseIcon : playIcon} alt="Play/Pause" />
          </button>
          <img src={nextIcon} alt="Next" onClick={handleNext} />
          <img src={repeatIcon} alt="Repeat" onClick={handleRepeat} />
        </div>

        <div className="seek-row">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="seek-bar"
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="right-info"></div>

      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate}>
        {currentSong && <source src={currentSong.audio} type="audio/mp3" />}
      </audio>
    </footer>
  );
};

export default Footer;
