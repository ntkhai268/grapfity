import React from "react";
// Import hook và kiểu dữ liệu trả về của nó
import useFooterAudioPlayer, { UseFooterAudioPlayerReturn } from "../hooks/FooterAudioPlayer"; 
// Import kiểu Song nếu cần (hoặc dùng Song từ GlobalAudioManager)
import { Song } from "../hooks/GlobalAudioManager"; 
import "../styles/Footer.css";

// Interface cho FooterLeft (có thể giữ nguyên hoặc điều chỉnh)
interface FooterLeftProps {
  // Nhận toàn bộ đối tượng song hoặc các thuộc tính riêng lẻ
  song: Song | null; // Cho phép null
}

const FooterLeft: React.FC<FooterLeftProps> = ({ song }) => {
  // Xử lý trường hợp song là null
  if (!song) {
    return (
      <div className="footer-left">
        <div className="playing-song">
          <img src="/assets/anhmau.png" alt="default" />
        </div>
        <div className="title-playing-song">
          <p className="song-title">Chưa chọn bài hát</p>
          <p className="song-artist">—</p>
        </div>
        <button className="btn-DC">
          <img src="/assets/plus.png" alt="Add" />
        </button>
      </div>
    );
  }

  // Render khi có song
  return (
    <div className="footer-left">
      <div className="playing-song">
        <img src={song.cover || "/assets/anhmau.png"} alt={song.title || 'Song cover'} />
      </div>
      <div className="title-playing-song">
        <p className="song-title">{song.title || 'Unknown Title'}</p>
        <p className="song-artist">{song.artist || 'Unknown Artist'}</p>
      </div>
      <button className="btn-DC">
        <img src="/assets/plus.png" alt="Add" />
      </button>
    </div>
  );
};

// Interface cho MusicControls (cần khớp với tên hàm từ hook)
interface MusicControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  playNext: () => void;    // <<< Sửa tên thành playNext
  playPrevious: () => void; // <<< Sửa tên thành playPrevious
}

const MusicControls: React.FC<MusicControlsProps> = ({
  isPlaying,
  togglePlay,
  playNext,     // <<< Sửa tên thành playNext
  playPrevious, // <<< Sửa tên thành playPrevious
}) => {
  return (
    <div className="music-controls">
      <button className="shuffle">
        <img src="/assets/shuffle.png" alt="Shuffle" />
      </button>
      {/* Gọi đúng hàm playPrevious */}
      <button className="prev" onClick={playPrevious}> 
        <img src="/assets/prev.png" alt="Previous" />
      </button>
      <button className="play-pause" onClick={togglePlay}>
        <img src={isPlaying ? "/assets/stop.png" : "/assets/play.png"} alt="Play/Pause" />
      </button>
      {/* Gọi đúng hàm playNext */}
      <button className="next" onClick={playNext}> 
        <img src="/assets/next.png" alt="Next" />
      </button>
      <button className="repeat">
        <img src="/assets/loop.png" alt="Repeat" />
      </button>
    </div>
  );
};

// Interface cho ProgressBar (giữ nguyên)
interface ProgressBarProps {
  currentTime: number; // Đổi thành number để tính toán
  duration: number;    // Đổi thành number
  progress: number;
  onSeek: (percent: number) => void; // onSeek nhận percent (0-100)
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  progress,
  onSeek,
}) => {
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) {
        return "0:00";
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (duration > 0) { // Chỉ seek khi có duration hợp lệ
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width) * 100; // Tính phần trăm
        onSeek(Math.max(0, Math.min(100, percent))); // Gọi onSeek với phần trăm (0-100)
    }
  };

  return (
    <div className="progress-container">
      <span className="current-time">{formatTime(currentTime)}</span>
      <div className="progress-bar" onClick={handleClick} style={{ cursor: duration > 0 ? 'pointer' : 'default' }}>
        <div className="current-progress" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="total-time">{formatTime(duration)}</span>
    </div>
  );
};


// --- Component Footer chính ---
const Footer: React.FC = () => {
  // --- SỬA LỖI: Destructure đúng tên từ hook ---
  const {
    currentSong, // <<< Sửa thành currentSong
    isPlaying,
    togglePlay,
    playNext,    // <<< Sửa thành playNext
    playPrevious,// <<< Sửa thành playPrevious
    currentTime,
    duration,
    progress,    // Lấy progress trực tiếp từ hook
    seekTo,      // Hàm seekTo từ hook nhận percent (0-100)
  }: UseFooterAudioPlayerReturn = useFooterAudioPlayer();
  // -----------------------------------------

  // Hàm formatTime có thể để ở đây hoặc trong ProgressBar
  // const formatTime = ... (Đã chuyển vào ProgressBar)

  // progress đã được tính trong hook, không cần tính lại
  // const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Hàm handleSeek giờ chỉ cần gọi seekTo từ hook với phần trăm
  const handleSeek = (percent: number) => {
    seekTo(percent);
  };

  // Phần render khi không có bài hát (có thể giữ nguyên hoặc dùng FooterLeft)
  // if (!currentSong) { ... } // Có thể dùng trực tiếp FooterLeft với song={null}

  return (
    <footer className="footer">
      {/* Truyền currentSong vào FooterLeft */}
      <FooterLeft song={currentSong} /> 
      <div className="music-player">
        {/* Truyền đúng tên hàm vào MusicControls */}
        <MusicControls
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          playNext={playNext}       // <<< Sửa tên
          playPrevious={playPrevious} // <<< Sửa tên
        />
        <ProgressBar
          currentTime={currentTime} // Truyền number
          duration={duration}       // Truyền number
          progress={progress}       // Truyền progress từ hook
          onSeek={handleSeek}       // Truyền hàm handleSeek đã sửa
        />
      </div>
      {/* Phần Volume Control và các phần khác có thể thêm vào đây */}
    </footer>
  );
};

export default Footer;
