import React, { useEffect, useRef } from "react";
// Import hook và kiểu dữ liệu trả về của nó
import useFooterAudioPlayer, { UseFooterAudioPlayerReturn } from "../hooks/FooterAudioPlayer"; 
// Import kiểu Song nếu cần (hoặc dùng Song từ GlobalAudioManager)
import GlobalAudioManager, { Song } from "../hooks/GlobalAudioManager"; 
import "../styles/Footer.css";
import  { RepeatButton, ShuffleButton } from './modeControl';
import { useNavigate, useParams } from "react-router-dom";
import VolumeControl from "./VolumeControl";
import { trackingListeningHistoryAPI } from "../services/listeningService";
import { sendEvent, EventType } from "../services/eventTracking";


// Interface cho FooterLeft (có thể giữ nguyên hoặc điều chỉnh)
interface FooterLeftProps {
  // Nhận toàn bộ đối tượng song hoặc các thuộc tính riêng lẻ
  song: Song | null; // Cho phép null
  onTitleClick?: () => void;
}

const FooterLeft: React.FC<FooterLeftProps> = ({ song, onTitleClick  }) => {
  
  
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

 

  // test xem có id ko 
  //  console.log(song.id);

  // Render khi có song
  return (
  
    <div className="footer-left">
      <div className="playing-song">
        <img src={song.cover || "/assets/anhmau.png"} alt={song.title || 'Song cover'} />
      </div>
      <div className="title-playing-song">
       <p className="song-title" onClick={onTitleClick} style={{ cursor: 'pointer' }}>
          {song.title || 'Unknown Title'}
        </p>
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

  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

const MusicControls: React.FC<MusicControlsProps> = ({
  isPlaying,
  togglePlay,
  playNext,     // <<< Sửa tên thành playNext
  playPrevious, // <<< Sửa tên thành playPrevious
  repeatMode,        // 👈 thêm dòng này
  isShuffle,         // 👈 thêm dòng này
  toggleRepeat,      // 👈 và dòng này
  toggleShuffle, 
}) => {
  return (
    <div className="music-controls">
      <ShuffleButton isActive={isShuffle} onToggle={toggleShuffle} />
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
      <RepeatButton mode={repeatMode} onToggle={toggleRepeat} />

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
    repeatMode,          // 👈 Thêm dòng này
    isShuffle,           // 👈 Thêm dòng này
    toggleRepeat,        // 👈 Thêm dòng này
    toggleShuffle,       // 👈 Thêm dòng này
    audioRef, 
    volume, 
    setVolume  
  }: UseFooterAudioPlayerReturn = useFooterAudioPlayer();

  const { userId: profileUserId } = useParams<{ userId: string }>();
  const viewedUserId = profileUserId ?? "me";

  // console.log("👈👈👈👈[Footer] render", {
  //   currentSong,
  //   isPlaying,
  //   repeatMode,
  //   isShuffle
  // });
  // -----------------------------------------
  const lastTrackedId = useRef<number | string | undefined>(undefined);

   useEffect(() => {
    // Chỉ gọi tracking khi có bài hát mới được play (chuyển bài, hoặc lần đầu vào player)
    if (
      currentSong?.id &&
      isPlaying &&
      currentSong.id !== lastTrackedId.current
    ) {
      trackingListeningHistoryAPI(currentSong.id)
        .catch(() => { /* ignore */ });

      sendEvent(Number(currentSong.id), EventType.Play, viewedUserId)
      lastTrackedId.current = currentSong.id;
    }
    // Không reset lastTrackedId khi pause, chỉ reset khi đổi sang bài khác!
  }, [currentSong?.id, isPlaying]);
  const navigate = useNavigate();

const goToManagerSong = () => {
  if (!currentSong) return;

  const playlist = GlobalAudioManager.getPlaylist();
  const index = playlist.findIndex((s) => s.id === currentSong.id);
  if (index === -1) return;

  localStorage.setItem("viewedSong", JSON.stringify(currentSong));
  localStorage.setItem("viewedPlaylist", JSON.stringify(playlist));
  localStorage.setItem("viewedIndex", index.toString());

  navigate("/ManagerSong", {
    state: {
      songs: playlist,
      currentIndex: index,
      currentSong: currentSong,
      context: { id: `footer-${currentSong.id}`, type: "queue" },
       _forceKey: Date.now(), // 🔥 ép state thay đổi để trigger re-render
    },
  });
};

  



  // Hàm handleSeek giờ chỉ cần gọi seekTo từ hook với phần trăm
  const handleSeek = (percent: number) => {
    seekTo(percent);
  };



  return (
    <footer className="footer">
      {/* Truyền currentSong vào FooterLeft */}
      <FooterLeft song={currentSong} onTitleClick={goToManagerSong} />

      <div className="music-player">
        {/* Truyền đúng tên hàm vào MusicControls */}
        <MusicControls
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          playNext={playNext}       // <<< Sửa tên
          playPrevious={playPrevious} // <<< Sửa tên
          repeatMode={repeatMode}             // 👈 thêm
          isShuffle={isShuffle}               // 👈 thêm
          toggleRepeat={toggleRepeat}         // 👈 thêm
          toggleShuffle={toggleShuffle}       // 👈 thêm
        />
        <ProgressBar
          currentTime={currentTime} // Truyền number
          duration={duration}       // Truyền number
          progress={progress}       // Truyền progress từ hook
          onSeek={handleSeek}       // Truyền hàm handleSeek đã sửa
        />
      </div>
      {/* Phần Volume Control và các phần khác có thể thêm vào đây */}
      <div className="footer-right-progress">
        <VolumeControl audioRef={audioRef} volume={volume} setVolume={setVolume} />
      </div>
    </footer>
  );
};

export default Footer;
