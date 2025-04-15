interface Song {
  src: string;
  title?: string;
  artist?: string;
  cover?: string;
}

const GlobalAudioManager = (() => {
  let currentSystem: string | null = null;
  let currentStopFunction: (() => void) | null = null;
  let currentAudio: HTMLAudioElement | null = null;
  let currentSong: Song | null = null;
  let isPlaying: boolean = false;
  let playlist: Song[] = [];
  let currentIndex: number = -1;
  let playCallback: ((index: number) => void) | null = null;
  let playlistContainer: HTMLElement | null = null;

  let currentTime: number = 0;
  let duration: number = 0;
  let progress: number = 0;

  const listeners: Set<() => void> = new Set();

  function notify(): void {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function setActive(
    systemName: string,
    stopFunction: () => void,
    audio: HTMLAudioElement,
    song: Song
  ): void {
    if (currentSystem && currentSystem !== systemName && currentStopFunction) {
      currentStopFunction();
    }
  
    currentSystem = systemName;
    currentStopFunction = stopFunction;
    currentAudio = audio;
    currentSong = song;
    isPlaying = true;
  
    // Sync trạng thái play/pause
    audio.onplay = () => {
      isPlaying = true;
      notify();
    };
  
    audio.onpause = () => {
      isPlaying = false;
      notify();
    };
  
    // Progress/time update
    audio.ontimeupdate = () => {
      currentTime = audio.currentTime;
      duration = audio.duration || 0;
      progress = duration ? (currentTime / duration) * 100 : 0;
      notify();
    };
  
    audio.onended = () => {
      isPlaying = false;
      notify();
    };
  
    if (audio.readyState >= 1) {
      notify();
    } else {
      audio.addEventListener(
        "loadedmetadata",
        () => {
          duration = audio.duration || 0;
          notify();
        },
        { once: true }
      );
    }
  }
  
  

  function setPlaylist(
    newPlaylist: Song[] = [],
    startIndex: number = 0,
    playFn: ((index: number) => void) | null = null,
    container: HTMLElement | null = null
  ): void {
    if (Array.isArray(newPlaylist) && newPlaylist.length > 0) {
      playlist = newPlaylist;
      currentIndex = startIndex;
      playCallback = typeof playFn === "function" ? playFn : null;
      playlistContainer = container;

      console.log("✅ Playlist set:", {
        currentIndex,
        playlist: playlist.map((el) => el?.title || el?.src),
        hasPlayCallback: typeof playCallback === "function",
      });
    }
  }

  function playSongAt(index: number): void {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;

    if (typeof playCallback === "function") {
      playCallback(index);
    }

    const song = playlist[index];
    if (!song) return;

    if (currentAudio && typeof currentAudio.pause === "function") {
      currentAudio.pause();
    }

    const audio = new Audio(song.src);
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.play();

    currentIndex = index;
    currentAudio = audio;
    currentSong = song;
    isPlaying = true;

    currentTime = 0;
    duration = 0;
    progress = 0;

    setActive("FooterPlayer", () => audio.pause(), audio, song);
    notify();
  }

  function playNext(): void {
    if (!playlist.length) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) return;

    playSongAt(nextIndex);
  }

  function playPrevious(): void {
    if (!playlist.length) return;

    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSongAt(prevIndex);
  }

  function isSamePlaylist(newPlaylist: Song[]): boolean {
    if (!playlist || playlist.length !== newPlaylist.length) return false;
    return playlist.every((song, index) => song.src === newPlaylist[index].src);
  }

  function seekTo(percent: number): void {
    if (currentAudio && duration && percent >= 0 && percent <= 100) {
      currentAudio.currentTime = (percent / 100) * duration;
    }
  }

  return {
    setActive,
    setPlaylist,
    playSongAt,
    playNext,
    playPrevious,
    subscribe,
    getPlaylist: (): Song[] => playlist,
    getCurrentIndex: (): number => currentIndex,
    isSamePlaylist,
    getCurrentSystem: (): string | null => currentSystem,
    getCurrentAudio: (): HTMLAudioElement | null => currentAudio,
    getCurrentSong: (): Song | null => currentSong,
    getIsPlaying: (): boolean => isPlaying,
    getCurrentTime: (): number => currentTime,
    getDuration: (): number => duration,
    getProgress: (): number => progress,
    seekTo,
    setIsPlaying: (state: boolean): void => {
      isPlaying = state;
      if (currentAudio) {
        state ? currentAudio.play() : currentAudio.pause();
      }
      notify();
    },
    setCurrentIndex: (index: number): void => {
      if (index >= 0 && index < playlist.length) {
        currentIndex = index;
      }
    },
    getPlaylistContainer: (): HTMLElement | null => playlistContainer,
    clearActive: (systemName: string): void => {
      if (currentSystem === systemName) {
        currentSystem = null;
        if (currentAudio) {
          currentAudio.pause();
        }
        currentAudio = null;
        currentStopFunction = null;
        currentSong = null;
        isPlaying = false;
        currentTime = 0;
        duration = 0;
        progress = 0;
        notify();
      }
    },
    getAudioElement: (): HTMLAudioElement | null => currentAudio,
  };
})();

declare global {
  interface Window {
    GlobalAudioManager: typeof GlobalAudioManager;
  }
}

if (typeof window !== "undefined") {
  window.GlobalAudioManager = GlobalAudioManager;
}

export default GlobalAudioManager;
export type { Song };
