import { useState, useEffect, useRef, RefObject, useCallback } from "react";
// Import GlobalAudioManager và các kiểu dữ liệu/interface cần thiết
// Đảm bảo đường dẫn này chính xác
import GlobalAudioManager, { Song } from "./GlobalAudioManager"; 

// Định nghĩa kiểu dữ liệu trả về của hook (khớp với những gì UI cần)
export interface UseSongManagerReturn {
  currentSong: Song | null;
  isPlaying: boolean;
  audioRef: RefObject<HTMLAudioElement | null>; // Ref tới audio element đang dùng
  songUrl: string | undefined;
  currentTrackId: string | number | null | undefined;
  currentTime: number;
  duration: number;
  progress: number;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (percent: number) => void;
  // Thêm các giá trị/hàm khác nếu component sử dụng hook này cần
}

/**
 * Custom hook để theo dõi và điều khiển trạng thái từ GlobalAudioManager.
 */
const useSongManager = (): UseSongManagerReturn => {
  // Sử dụng state để trigger re-render khi GlobalAudioManager thay đổi
  // State này chứa các giá trị đọc từ GlobalAudioManager
  const [managerState, setManagerState] = useState({
    currentSong: GlobalAudioManager.getCurrentSong(),
    isPlaying: GlobalAudioManager.getIsPlaying(),
    currentTime: GlobalAudioManager.getCurrentTime(),
    duration: GlobalAudioManager.getDuration(),
    progress: GlobalAudioManager.getProgress(),
    _audioElement: GlobalAudioManager.getAudioElement(), // Lấy audio element để cập nhật ref
  });

  // Tạo một ref ổn định để trả về. Component cha sẽ dùng ref này.
  // Giá trị .current của ref sẽ được cập nhật bên dưới.
  const audioRef = useRef<HTMLAudioElement | null>(managerState._audioElement); 

  // Effect để cập nhật giá trị .current của audioRef khi nó thay đổi trong GlobalAudioManager
  useEffect(() => {
      if (audioRef.current !== managerState._audioElement) {
          audioRef.current = managerState._audioElement;
      }
  }, [managerState._audioElement]);


  useEffect(() => {
    // Hàm được gọi mỗi khi GlobalAudioManager thông báo có thay đổi
    const updateStateFromManager = () => {
      // console.log("[useSongManager] GlobalAudioManager notified. Updating state.");
      setManagerState({
        currentSong: GlobalAudioManager.getCurrentSong(),
        isPlaying: GlobalAudioManager.getIsPlaying(),
        currentTime: GlobalAudioManager.getCurrentTime(),
        duration: GlobalAudioManager.getDuration(),
        progress: GlobalAudioManager.getProgress(),
        _audioElement: GlobalAudioManager.getAudioElement(),
      });
    };

    // Đăng ký lắng nghe thay đổi từ GlobalAudioManager
    const unsubscribe = GlobalAudioManager.subscribe(updateStateFromManager);

    // Cập nhật state lần đầu khi hook mount để lấy giá trị hiện tại
    updateStateFromManager(); 

    // Hủy đăng ký khi component unmount
    return () => {
      // console.log("[useSongManager] Unsubscribing from GlobalAudioManager.");
      unsubscribe();
    };
  }, []); // Chỉ chạy một lần khi hook mount

  // --- Các hàm điều khiển ---
  // Các hàm này giờ chỉ đơn giản là gọi các phương thức của GlobalAudioManager

  const togglePlay = useCallback(() => {
    // console.log("[useSongManager] togglePlay called.");
    if (GlobalAudioManager.getIsPlaying()) {
      GlobalAudioManager.pausePlayback();
    } else {
      const audio = GlobalAudioManager.getCurrentAudio();
      const song = GlobalAudioManager.getCurrentSong();
      if (audio && song) {
         // Gọi playAudio để đảm bảo setActive được gọi đúng cách nếu cần
         GlobalAudioManager.playAudio(audio, song); 
         // Hoặc đơn giản hơn nếu chỉ là resume:
         // GlobalAudioManager.setIsPlaying(true); 
      } else {
          console.warn("[useSongManager] Cannot toggle play: No current audio or song in GlobalAudioManager.");
          // Có thể thử phát bài đầu tiên của playlist nếu có
          // if (GlobalAudioManager.getPlaylist().length > 0) {
          //   GlobalAudioManager.playSongAt(0);
          // }
      }
    }
  }, []); // useCallback để tránh tạo lại hàm không cần thiết

  const playNext = useCallback(() => {
    // console.log("[useSongManager] playNext called.");
    GlobalAudioManager.playNext();
  }, []);

  const playPrevious = useCallback(() => {
    // console.log("[useSongManager] playPrevious called.");
    GlobalAudioManager.playPrevious();
  }, []);

  const seekTo = useCallback((percent: number) => {
    // console.log(`[useSongManager] seekTo called with percent: ${percent}`);
    GlobalAudioManager.seekTo(percent);
    // Không cần cập nhật state currentTime ở đây vì GlobalAudioManager sẽ notify
  }, []);

  // Trả về các giá trị state và hàm điều khiển
  return {
    currentSong: managerState.currentSong,
    isPlaying: managerState.isPlaying,
    audioRef: audioRef, // Trả về ref
    songUrl: managerState.currentSong?.src, 
    currentTrackId: managerState.currentSong?.id, 
    currentTime: managerState.currentTime,
    duration: managerState.duration,
    progress: managerState.progress,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
  };
};

export default useSongManager;
