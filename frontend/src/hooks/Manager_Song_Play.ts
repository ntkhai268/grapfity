import { useState, useEffect, useRef } from "react";
import GlobalAudioManager, { Song } from "./GlobalAudioManager";

/**
 * Custom hook để quản lý phát nhạc.
 * Có thể truyền vào danh sách bài hát (songs) và index khởi đầu.
 */
const useSongManager = (songs?: Song[], initialIndex: number = 0) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(
    songs ? songs[initialIndex] : GlobalAudioManager.getCurrentSong()
  );

  const [isPlaying, setIsPlaying] = useState<boolean>(
    GlobalAudioManager.getIsPlaying()
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pausedByUserRef = useRef(false);

  useEffect(() => {
    if (!songs) {
      const unsubscribe = GlobalAudioManager.subscribe(() => {
        const globalSong = GlobalAudioManager.getCurrentSong();
        setCurrentSong(globalSong);
  
        if (!pausedByUserRef.current) {
          setIsPlaying(GlobalAudioManager.getIsPlaying());
        }
      });
  
      return () => {unsubscribe();};
    } else {
      const globalSong = GlobalAudioManager.getCurrentSong();
  
      // Nếu bài hiện tại trong useManager khác với bài trong global => pause
      if (globalSong?.src !== songs[initialIndex]?.src) {
        console.log("🛑 [useSongManager] Không trùng bài hát với Global:", {
          global: globalSong?.title,
          local: songs[initialIndex]?.title,
        });
        setIsPlaying(false);
      } else {
        console.log("✅ [useSongManager] Trùng bài với Global:", globalSong?.title);
      }
    }
  }, [songs, initialIndex]);
  


  const togglePlay = () => {
    const audio = audioRef.current;
    const song = currentSong;
    if (!audio || !song) return;

    const currentSystem = GlobalAudioManager.getCurrentSystem();

    if (isPlaying) {
      console.log("⏸ [useSongManager] Pause");
      audio.pause();
      setIsPlaying(false);
      pausedByUserRef.current = true;
    } else {
      console.log("▶️ [useSongManager] Play", song);
      pausedByUserRef.current = false;

      if (currentSystem !== "useSongManager") {
        GlobalAudioManager.setActive(
          "useSongManager",
          () => {
            audio.pause();
            setIsPlaying(false);
          },
          audio,
          song
        );
      }

      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("🎧 Failed to play:", err));
    }
  };

  return {
    audioRef,
    currentSong,
    songUrl: currentSong?.src,
    isPlaying,
    togglePlay,
    currentTrackId: currentSong?.id,
  };
};

export default useSongManager;
