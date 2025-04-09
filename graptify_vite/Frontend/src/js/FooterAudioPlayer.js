import { useEffect, useState } from "react";
import GlobalAudioManager from "./GlobalAudioManager";

const useFooterAudioPlayer = () => {
  const [song, setSong] = useState(GlobalAudioManager.getCurrentSong());
  const [isPlaying, setIsPlaying] = useState(GlobalAudioManager.getIsPlaying());
  const [audio, setAudio] = useState(GlobalAudioManager.getCurrentAudio());

  useEffect(() => {
    const handleChange = () => {
      setSong(GlobalAudioManager.getCurrentSong());
      setIsPlaying(GlobalAudioManager.getIsPlaying());
      setAudio(GlobalAudioManager.getCurrentAudio());
    };

    const unsubscribe = GlobalAudioManager.subscribe(handleChange);
    return () => unsubscribe();
  }, []);

  const togglePlay = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    GlobalAudioManager.setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    GlobalAudioManager.playNext();
  };

  const prevSong = () => {
    GlobalAudioManager.playPrevious();
  };

  return {
    song,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
  };
};

export default useFooterAudioPlayer;
