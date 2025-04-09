const GlobalAudioManager = (() => {
  let currentSystem = null;
  let currentStopFunction = null;
  let currentAudio = null;
  let currentSong = null;
  let isPlaying = false;
  let playlist = [];
  let currentIndex = -1;

  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function setActive(systemName, stopFunction, audio, song, newPlaylist = [], startIndex = 0) {
    // Dừng hệ thống cũ nếu đang hoạt động và khác hệ thống mới
    if (currentSystem && currentSystem !== systemName && currentStopFunction) {
      currentStopFunction();
    }

    currentSystem = systemName;
    currentStopFunction = stopFunction;
    currentAudio = audio;
    currentSong = song;
    isPlaying = true;

    if (Array.isArray(newPlaylist) && newPlaylist.length > 0) {
      playlist = newPlaylist;
      currentIndex = startIndex;
    }

    notify();
  }

  function playSongAt(index) {
    if (index < 0 || index >= playlist.length) return;

    const song = playlist[index];
    if (!song) return;

    // Dừng bài đang phát hiện tại nếu có
    if (currentAudio && typeof currentAudio.pause === "function") {
      currentAudio.pause();
    }

    const audio = new Audio(song.src);
    audio.play();

    currentIndex = index;
    setActive("FooterPlayer", () => audio.pause(), audio, song, playlist, index);
  }

  function playNext() {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSongAt(nextIndex);
  }

  function playPrevious() {
    if (playlist.length === 0) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSongAt(prevIndex);
  }

  function setPlaylist(newPlaylist = [], startIndex = 0) {
    if (Array.isArray(newPlaylist) && newPlaylist.length > 0) {
      playlist = newPlaylist;
      playSongAt(startIndex);
      notify();
    }
  }

  return {
    setActive,
    setPlaylist,
    getCurrentSystem: () => currentSystem,
    getCurrentAudio: () => currentAudio,
    getCurrentSong: () => currentSong,
    getIsPlaying: () => isPlaying,
    setIsPlaying: (state) => {
      isPlaying = state;
      notify();
    },
    subscribe,
    playNext,
    playPrevious,
    getPlaylist: () => playlist,
    getCurrentIndex: () => currentIndex,
  };
})();

export default GlobalAudioManager;
