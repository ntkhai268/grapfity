import { useState, useEffect, useRef } from "react";
import GlobalAudioManager, { Song } from "./GlobalAudioManager";

const useSongManager = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(GlobalAudioManager.getCurrentSong());
  const [isPlaying, setIsPlaying] = useState<boolean>(GlobalAudioManager.getIsPlaying());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pausedByUserRef = useRef(false); // Để không bị auto play lại sau khi pause

  // Đăng ký listener từ GlobalAudioManager
  useEffect(() => {
    const unsubscribe = GlobalAudioManager.subscribe(() => {
      setCurrentSong(GlobalAudioManager.getCurrentSong());

      if (!pausedByUserRef.current) {
        setIsPlaying(GlobalAudioManager.getIsPlaying());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    const song = currentSong;
    if (!audio || !song) return;

    const currentSystem = GlobalAudioManager.getCurrentSystem();

    if (isPlaying) {
      console.log("⏸ [useSongManager] Pause");
      audio.pause();
      setIsPlaying(false);
      pausedByUserRef.current = true; // Đánh dấu là do người dùng pause
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
  };
};

export default useSongManager;
