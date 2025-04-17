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
  let isPlaying = false;
  let playlist: Song[] = [];
  let currentIndex = -1;
  let playCallback: ((index: number) => void) | null = null;
  let playlistContainer: HTMLElement | null = null;
  let onPlaylistEnded: (() => void) | null = null;

  let currentTime = 0;
  let duration = 0;
  let progress = 0;

  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach(listener => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function setActive(
    systemName: string,
    stopFunction: () => void,
    audio: HTMLAudioElement,
    song: Song
  ) {
    if (currentSystem && currentSystem !== systemName && currentStopFunction) {
      currentStopFunction();
    }

    currentSystem = systemName;
    currentStopFunction = stopFunction;
    currentAudio = audio;
    currentSong = song;
    isPlaying = true;

    // Sync playback events
    audio.onplay = () => {
      isPlaying = true;
      notify();
    };

    audio.onpause = () => {
      isPlaying = false;
      notify();
    };

    audio.ontimeupdate = () => {
      currentTime = audio.currentTime;
      duration = audio.duration || 0;
      progress = duration ? (currentTime / duration) * 100 : 0;
      notify();
    };

    audio.onended = () => {
      isPlaying = false;
      notify();
      const nextIndex = currentIndex + 1;

      if (nextIndex < playlist.length) {
        playSongAt(nextIndex);
      } else {
        onPlaylistEnded?.(); // Gọi nếu hết playlist
      }
    };

    if (audio.readyState >= 1) {
      notify();
    } else {
      audio.addEventListener("loadedmetadata", () => {
        duration = audio.duration || 0;
        notify();
      }, { once: true });
    }
  }

  function setPlaylist(
    newPlaylist: Song[],
    startIndex = 0,
    playFn: ((index: number) => void) | null = null,
    container: HTMLElement | null = null,
    onEnded?: () => void
  ) {
    if (!Array.isArray(newPlaylist) || !newPlaylist.length) return;

    playlist = newPlaylist;
    currentIndex = startIndex;
    playCallback = playFn;
    playlistContainer = container;
    onPlaylistEnded = onEnded || null;

    console.log("✅ Playlist set:", {
      currentIndex,
      playlist: playlist.map(el => el.title || el.src),
      hasPlayCallback: !!playCallback,
    });
  }

  function playSongAt(index: number) {
    if (index < 0 || index >= playlist.length) return;

    currentIndex = index;
    const song = playlist[index];
    if (!song) return;

    currentAudio?.pause();

    const audio = new Audio(song.src);
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";

    currentAudio = audio;
    currentSong = song;
    isPlaying = true;

    currentTime = 0;
    duration = 0;
    progress = 0;

    setActive("FooterPlayer", () => audio.pause(), audio, song);
    notify();
    notifySongChanged();

    audio.play().catch(err => {
      console.error("🔴 audio.play() failed:", err);
      isPlaying = false;
      notify();
    });

    playCallback?.(index);
  }

  function playNext() {
    if (!playlist.length) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      playSongAt(nextIndex);
    } else {
      onPlaylistEnded?.(); // Đã hết playlist → gọi tiếp
    }
  }

  function playPrevious() {
    if (!playlist.length) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSongAt(prevIndex);
  }

  function isSamePlaylist(newPlaylist: Song[]) {
    return (
      playlist.length === newPlaylist.length &&
      playlist.every((s, i) => s.src === newPlaylist[i].src)
    );
  }

  function seekTo(percent: number) {
    if (currentAudio && duration && percent >= 0 && percent <= 100) {
      currentAudio.currentTime = (percent / 100) * duration;
    }
  }

  function clearActive(systemName: string) {
    if (currentSystem !== systemName) return;

    currentSystem = null;
    currentAudio?.pause();
    currentAudio = null;
    currentStopFunction = null;
    currentSong = null;
    isPlaying = false;
    currentTime = 0;
    duration = 0;
    progress = 0;
    notify();
  }

  return {
    setActive,
    setPlaylist,
    playSongAt,
    playNext,
    playPrevious,
    subscribe,
    getPlaylist: () => playlist,
    getCurrentIndex: () => currentIndex,
    isSamePlaylist,
    getCurrentSystem: () => currentSystem,
    getCurrentAudio: () => currentAudio,
    getCurrentSong: () => currentSong,
    getIsPlaying: () => isPlaying,
    getCurrentTime: () => currentTime,
    getDuration: () => duration,
    getProgress: () => progress,
    seekTo,
    setIsPlaying: (state: boolean) => {
      isPlaying = state;
      if (currentAudio) {
        state ? currentAudio.play() : currentAudio.pause();
      }
      notify();
    },
    setCurrentIndex: (index: number) => {
      if (index >= 0 && index < playlist.length) {
        currentIndex = index;
      }
    },
    getPlaylistContainer: () => playlistContainer,
    clearActive,
    getAudioElement: () => currentAudio,
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
export const notifySongChanged = () => {
  window.dispatchEvent(new Event("songchanged"));
};
