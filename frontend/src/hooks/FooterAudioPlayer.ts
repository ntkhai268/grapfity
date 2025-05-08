import { useState, useEffect, useRef, RefObject, useCallback } from "react";
// Import GlobalAudioManager và kiểu Song.
// Đảm bảo đường dẫn này chính xác
import GlobalAudioManager, { Song } from "./GlobalAudioManager"; 

// Định nghĩa kiểu dữ liệu trả về của hook
export interface UseFooterAudioPlayerReturn {
  currentSong: Song | null;
  isPlaying: boolean;
  audioRef: RefObject<HTMLAudioElement | null>; 
  songUrl: string | undefined;
  currentTrackId: string | number | null | undefined;
  currentTime: number;
  duration: number;
  progress: number;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (percent: number) => void;
}

/**
 * Custom hook để theo dõi và điều khiển trạng thái từ GlobalAudioManager,
 * dùng cho Footer Audio Player.
 */
const useFooterAudioPlayer = (): UseFooterAudioPlayerReturn => {
  const [managerState, setManagerState] = useState({
    currentSong: GlobalAudioManager.getCurrentSong(),
    isPlaying: GlobalAudioManager.getIsPlaying(),
    currentTime: GlobalAudioManager.getCurrentTime(),
    duration: GlobalAudioManager.getDuration(),
    progress: GlobalAudioManager.getProgress(),
    _audioElement: GlobalAudioManager.getAudioElement(), 
  });

  const audioRef = useRef<HTMLAudioElement | null>(managerState._audioElement); 

  useEffect(() => {
      if (audioRef.current !== managerState._audioElement) {
          audioRef.current = managerState._audioElement;
      }
  }, [managerState._audioElement]);


  useEffect(() => {
    // Hàm cập nhật state dựa trên GlobalAudioManager
    const updateStateFromManager = () => {
      // console.log("[useFooterAudioPlayer] Updating state from GlobalAudioManager");
      setManagerState({
        currentSong: GlobalAudioManager.getCurrentSong(),
        isPlaying: GlobalAudioManager.getIsPlaying(),
        currentTime: GlobalAudioManager.getCurrentTime(),
        duration: GlobalAudioManager.getDuration(),
        progress: GlobalAudioManager.getProgress(),
        _audioElement: GlobalAudioManager.getAudioElement(),
      });
    };

    // Đăng ký lắng nghe thay đổi
    const unsubscribe = GlobalAudioManager.subscribe(updateStateFromManager);
    
    // --- QUAN TRỌNG: Cập nhật state lần đầu ngay sau khi subscribe ---
    // Để lấy trạng thái mới nhất có thể đã được load từ localStorage
    console.log("[useFooterAudioPlayer] Initial state sync after subscribe.");
    updateStateFromManager(); 
    // --------------------------------------------------------------

    // Hủy đăng ký khi component unmount
    return () => {
      // console.log("[useFooterAudioPlayer] Unsubscribing.");
      unsubscribe();
    };
  }, []); // Chỉ chạy một lần khi hook mount

  // --- Các hàm điều khiển (gọi GlobalAudioManager) ---
  const togglePlay = useCallback(() => { /* ... giữ nguyên ... */ 
      if (GlobalAudioManager.getIsPlaying()) {
        GlobalAudioManager.pausePlayback();
      } else {
        const audio = GlobalAudioManager.getCurrentAudio();
        const song = GlobalAudioManager.getCurrentSong();
        if (audio && song) {
           GlobalAudioManager.playAudio(audio, song); 
        } else {
            console.warn("[useFooterAudioPlayer] Cannot toggle play: No current audio or song.");
        }
      }
  }, []); 

  const playNext = useCallback(() => { /* ... giữ nguyên ... */ 
      GlobalAudioManager.playNext();
  }, []);

  const playPrevious = useCallback(() => { /* ... giữ nguyên ... */ 
      GlobalAudioManager.playPrevious();
  }, []);

  const seekTo = useCallback((percent: number) => { /* ... giữ nguyên ... */ 
      GlobalAudioManager.seekTo(percent);
  }, []);

  // Trả về các giá trị state và hàm điều khiển
  return {
    currentSong: managerState.currentSong,
    isPlaying: managerState.isPlaying,
    audioRef: audioRef, 
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

export default useFooterAudioPlayer;
