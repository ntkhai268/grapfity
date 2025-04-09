import { useState, useEffect, useRef } from "react";
import GlobalAudioManager from "./GlobalAudioManager"; 

const useSongManager = () => {
  const [songUrl, setSongUrl] = useState(localStorage.getItem("currentSong") || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const newSong = localStorage.getItem("currentSong") || "";
      setSongUrl(newSong);

      // ❌ Không auto load nữa để tránh bị auto kích hoạt
      // if (audioRef.current && newSong) {
      //   audioRef.current.load();
      //   setIsPlaying(false);
      // }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      console.log("⏸ [useSongManager] Pause");
      audioRef.current.pause();
      setIsPlaying(false);
      GlobalAudioManager.clearActive("useSongManager");
    } else {
      const song = {
        title: localStorage.getItem("currentSongTitle") || "Không rõ",
        artist: localStorage.getItem("currentSongArtist") || "Không rõ",
        cover: localStorage.getItem("currentSongCover") || "assets/anhmau.png",
        src: songUrl,
      };

      console.log("▶️ [useSongManager] Play");
      console.log("→ Song:", song);

      GlobalAudioManager.setActive(
        "useSongManager",
        () => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        },
        {
          current: {
            play: () => audioRef.current?.play(),
            pause: () => audioRef.current?.pause(),
            stop: () => audioRef.current?.pause()
          }
        },
        song
      );

      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return {
    audioRef,
    songUrl,
    isPlaying,
    togglePlay,
  };
};

export default useSongManager;
