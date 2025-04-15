import { useEffect, useState } from "react";
import GlobalAudioManager, { Song } from "./GlobalAudioManager";

const useFooterAudioPlayer = () => {
  const [song, setSong] = useState<Song | null>(GlobalAudioManager.getCurrentSong());
  const [isPlaying, setIsPlaying] = useState<boolean>(GlobalAudioManager.getIsPlaying());
  const [audio, setAudio] = useState<HTMLAudioElement | null>(GlobalAudioManager.getCurrentAudio());
  const [duration, setDuration] = useState<number>(GlobalAudioManager.getDuration());
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    const handleChange = () => {
      const newAudio = GlobalAudioManager.getCurrentAudio();
      setSong(GlobalAudioManager.getCurrentSong());
      setIsPlaying(GlobalAudioManager.getIsPlaying());
      setAudio(newAudio);
      setDuration(GlobalAudioManager.getDuration());
      setCurrentTime(GlobalAudioManager.getCurrentTime());
    };
  
    const unsubscribe = GlobalAudioManager.subscribe(handleChange);
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    console.log("🕒 currentTime changed:", currentTime);
  }, [currentTime]);

  // Cập nhật duration & currentTime khi audio thay đổi
  useEffect(() => {
    if (!audio) return;
    console.log("⏱ audio time update effect", audio);

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    // Nếu metadata đã sẵn sàng (load nhanh), set luôn duration
    if (audio.readyState >= 1) {
      setDuration(audio.duration || 0);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audio]);

  const togglePlay = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    GlobalAudioManager.setIsPlaying(!isPlaying);
  };

  const simulateClickCurrentSong = () => {
    const currentSrc = GlobalAudioManager.getCurrentSong()?.src;
    const songEl = document.querySelector(`.content.active .song[data-src="${currentSrc}"]`);
    const playBtn = songEl?.querySelector(".play_button") as HTMLElement;
    playBtn?.click();
  };
  const seekTo = (time: number) => {
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const nextSong = () => {
    const playlist = GlobalAudioManager.getPlaylist();
    const currentIndex = GlobalAudioManager.getCurrentIndex();

    const oldAudio = GlobalAudioManager.getCurrentAudio();
    oldAudio?.pause();
    if (oldAudio) oldAudio.currentTime = 0;

    if (currentIndex < playlist.length - 1) {
      GlobalAudioManager.playNext();
    } else {
      simulateClickCurrentSong(); // phát lại bài hiện tại
      return;
    }

    simulateClickCurrentSong();
  };

  const prevSong = () => {
    const currentIndex = GlobalAudioManager.getCurrentIndex();

    const oldAudio = GlobalAudioManager.getCurrentAudio();
    oldAudio?.pause();
    if (oldAudio) oldAudio.currentTime = 0;

    if (currentIndex > 0) {
      GlobalAudioManager.playPrevious();
    } else {
      simulateClickCurrentSong(); // phát lại bài hiện tại
      return;
    }

    simulateClickCurrentSong();
  };

  return {
    song,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    duration,
    currentTime,
    seekTo,
  };
};

export default useFooterAudioPlayer;
