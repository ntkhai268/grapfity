// Đảm bảo interface Song và PlaylistContext được định nghĩa hoặc import đúng cách
export interface Song {
    id: number | string;
    src: string;
    title?: string;
    artist?: string;
    cover?: string;
  }
  
  export interface PlaylistContext {
    id: string | number; // ID định danh cho playlist (ví dụ: từ DB, API)
    type: 'profile'| 'album' | 'playlist' | 'artist' | 'search' | 'queue' | 'waveform' |'section'| string; // Loại ngữ cảnh playlist
  }
  
  // --- Constants cho localStorage keys ---
  const LS_PLAYLIST_CONTEXT = 'lastPlaylistContext';
  const LS_TRACK_ID = 'lastPlayedTrackId';
  const LS_TRACK_INDEX = 'lastPlayedIndex';
  const LS_PLAYBACK_TIME = 'lastPlaybackTime';
  
  // --- Định nghĩa Interface cho đối tượng GlobalAudioManager trả về ---
  export interface IGlobalAudioManager {
    setActive: (systemName: string, stopFunction: () => void, audio: HTMLAudioElement, song: Song, context?: PlaylistContext | null) => void;
    setPlaylist: (newPlaylist: Song[], startIndex: number, context: PlaylistContext, playFn?: ((index: number) => void) | null, container?: HTMLElement | null, onEnded?: () => void) => void;
    playSongAt: (index: number, preferredAudioElement?: HTMLAudioElement) => void;
    playNext: () => void;
    playPrevious: () => void;
    subscribe: (listener: () => void) => () => void;
    getPlaylist: () => Song[];
    getCurrentIndex: () => number;
    isSamePlaylist: (newPlaylist: Song[], newContext?: PlaylistContext) => boolean;
    getCurrentSystem: () => string | null;
    getCurrentAudio: () => HTMLAudioElement | null;
    getCurrentSong: () => Song | null;
    getIsPlaying: () => boolean;
    getCurrentTime: () => number;
    getDuration: () => number;
    getProgress: () => number;
    getCurrentContext: () => PlaylistContext | null;
    seekTo: (percent: number) => void;
    setIsPlaying: (state: boolean) => void;
    setCurrentIndex: (index: number) => void;
    getPlaylistContainer: () => HTMLElement | null;
    clearActive: (systemName: string) => void;
    getAudioElement: () => HTMLAudioElement | null;
    playAudio: (audio: HTMLAudioElement, song: Song, context?: PlaylistContext) => void;
    pausePlayback: () => void;
    loadInitialState: (fetchPlaylistCallback: (context: PlaylistContext) => Promise<Song[] | null>) => Promise<void>;
    setShuffle: (state: boolean) => void;
    toggleShuffle: () => void;
    setRepeat: (mode: 'off' | 'one' | 'all') => void;
    getRepeat: () => 'off' | 'one' | 'all';
    getShuffle: () => boolean;
    }
  
  // --- IIFE để tạo GlobalAudioManager ---
  const GlobalAudioManager = ((): IGlobalAudioManager => {
    let currentSystem: string | null = null;
    let currentStopFunction: (() => void) | null = null;
    let currentAudio: HTMLAudioElement | null = null;
    let currentSong: Song | null = null;
    let isPlaying = false;
    let playlist: Song[] = [];
    let currentIndex = -1;
    let currentPlaylistContext: PlaylistContext | null = null;
    let playCallback: ((index: number) => void) | null = null;
    let playlistContainer: HTMLElement | null = null;
    let onPlaylistEnded: (() => void) | null = null;
    let isTransitioning = false; // Cờ khóa chuyển đổi

    let isShuffle = false; // chế độ phát ngẫu nhiên
    type RepeatMode = 'off' | 'one' | 'all';
    let repeatMode: RepeatMode = 'off';  

    let currentTime = 0;
    let duration = 0;
    let progress = 0;
  
    const listeners = new Set<() => void>();
  
    function notify() {
      listeners.forEach(listener => listener());
    }
  
    function subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  
    function saveLastPlayedState() {
      if (!currentSong || !currentPlaylistContext || currentIndex < 0) {
        return;
      }
      try {
        localStorage.setItem(LS_PLAYLIST_CONTEXT, JSON.stringify(currentPlaylistContext));
        localStorage.setItem(LS_TRACK_ID, String(currentSong.id));
        localStorage.setItem(LS_TRACK_INDEX, String(currentIndex));
        localStorage.setItem(LS_PLAYBACK_TIME, String(currentAudio?.currentTime || 0));
      } catch (e) {
        console.error("[GlobalAudioManager] Error saving state to localStorage:", e); // Giữ lại lỗi quan trọng
      }
    }
  
    function clearSavedPlayerState() {
      localStorage.removeItem(LS_PLAYLIST_CONTEXT);
      localStorage.removeItem(LS_TRACK_ID);
      localStorage.removeItem(LS_TRACK_INDEX);
      localStorage.removeItem(LS_PLAYBACK_TIME);
    }
  
    function detachListenersFromAudio(audioInstance: HTMLAudioElement | null) {
      if (audioInstance) {
        audioInstance.onplay = null;
        audioInstance.onpause = null;
        audioInstance.ontimeupdate = null;
        audioInstance.onended = null;
        audioInstance.removeEventListener("loadedmetadata", handleAudioMetadata);
        audioInstance.removeEventListener("error", handleAudioError);
      }
    }
  
    function updateCurrentState(
      song: Song | null,
      index: number,
      context: PlaylistContext | null,
      newAudioInstance?: HTMLAudioElement | null
    ) {
      const songChanged = currentSong?.id !== song?.id;
      const audioInstanceChanged = newAudioInstance !== undefined && currentAudio !== newAudioInstance;
  
      if (audioInstanceChanged) {
        if (currentAudio) {
          detachListenersFromAudio(currentAudio);
        }
        currentAudio = newAudioInstance;
        if (currentAudio) {
          attachAudioListeners(currentAudio);
        }
      }
  
      currentSong = song;
      currentIndex = index;
      currentPlaylistContext = context;
  
      if (!currentAudio) {
        currentTime = 0;
        duration = 0;
        progress = 0;
        isPlaying = false;
      } else {
        isPlaying = !currentAudio.paused && currentAudio.readyState > 0;
      }
  
      if (!song || index < 0) {
        clearSavedPlayerState();
      } else {
        saveLastPlayedState();
      }
  
      notify();
  
      if (songChanged && song) {
        notifySongChanged();
      }
    }
  
    const handleAudioError = (event: Event) => {
      const erroredAudio = event.target as HTMLAudioElement;
      console.error("[GlobalAudioManager] Audio error:", erroredAudio.error, "on src:", erroredAudio.src); // Giữ lại lỗi quan trọng
      if (currentAudio === erroredAudio) {
        isPlaying = false;
        notify();
      }
    };
  
    function attachAudioListeners(audio: HTMLAudioElement) {
      detachListenersFromAudio(audio);
  
      audio.onplay = () => {
        if (!isPlaying) {
          isPlaying = true;
          notify();
        }
      };
      audio.onpause = () => {
        if (isPlaying && (!audio.duration || Math.abs(audio.currentTime - audio.duration) > 0.01)) {
          isPlaying = false;
          notify();
        }
      };
      audio.ontimeupdate = () => {
        currentTime = audio.currentTime;
        duration = audio.duration || 0;
        progress = duration && !isNaN(duration) ? (currentTime / duration) * 100 : 0;
        notify();
      };
      audio.onended = () => {
        isPlaying = false;
        currentTime = duration;
        progress = 100;
        notify();
  
        const nextIndex = currentIndex + 1;
        if (nextIndex < playlist.length) {
          if (playCallback) {
            playCallback(nextIndex);
          } else {
            playSongAt(nextIndex);
          }
        } else {
          updateCurrentState(currentSong, currentIndex, currentPlaylistContext, currentAudio);
          onPlaylistEnded?.();
        }
      };
      audio.addEventListener("loadedmetadata", handleAudioMetadata, { once: true });
      audio.addEventListener("error", handleAudioError, { once: true });
    }
  
    const handleAudioMetadata = () => {
      if (currentAudio) {
        duration = currentAudio.duration || 0;
        notify();
      }
    };
  
    function setActive(
      systemName: string,
      stopFunction: () => void,
      audio: HTMLAudioElement,
      song: Song,
      context?: PlaylistContext | null
    ) {
      if (currentSystem && currentSystem !== systemName && currentStopFunction) {
        currentStopFunction();
      }
  
      currentSystem = systemName;
      currentStopFunction = stopFunction;
  
      const newContext = context !== undefined ? context : currentPlaylistContext;
      const songIndexInCurrentPlaylist = playlist.findIndex(pSong => pSong.id === song.id);
      const newIndex = songIndexInCurrentPlaylist !== -1 ? songIndexInCurrentPlaylist : (playlist.length > 0 ? 0 : -1) ;
  
      updateCurrentState(song, newIndex, newContext, audio);
    }
  
    function setPlaylist(
      newPlaylist: Song[],
      startIndex = 0,
      context: PlaylistContext,
      playFnInput?: ((index: number) => void) | null,
      containerInput?: HTMLElement | null,
      onEndedInput?: () => void
  
    ) {
    
     console.log("👈👈[GlobalAudioManager] setPlaylist called", {
      playlistLength: newPlaylist.length,
      context,
      currentIndex,
      isPlaying,
    });
      if (!Array.isArray(newPlaylist) || !context) {
        console.error("[GlobalAudioManager] Invalid parameters for setPlaylist."); // Giữ lại lỗi quan trọng
        return;
      }
  
      playlistContainer = containerInput === undefined ? null : containerInput;
      onPlaylistEnded = onEndedInput === undefined ? null : onEndedInput;
      playCallback = playFnInput === undefined ? null : playFnInput;
  
      if (!isSamePlaylist(newPlaylist, context)) {
        playlist = [...newPlaylist];
        currentPlaylistContext = context;
         updateCurrentState(null, -1, context, currentAudio); // mới
        if (newPlaylist.length > 0 && startIndex >= 0 && startIndex < newPlaylist.length) {
          // Chỉ chuẩn bị state, không tự động phát
          updateCurrentState(newPlaylist[startIndex], startIndex, context, undefined);// mới mới
          
        } else {
          updateCurrentState(null, -1, context, currentAudio);
        }
      } else {
        if (currentIndex !== startIndex && startIndex >= 0 && startIndex < playlist.length) {
          if (playCallback) {
            playCallback(startIndex);
          } else {
            playSongAt(startIndex);
          }
        }
      }
    }
  
    function playSongAt(index: number, preferredAudioElement?: HTMLAudioElement) {
    
      if (isTransitioning) {
        // console.warn(`[GlobalAudioManager] playSongAt(${index}) ignored: Currently transitioning.`);
        return;
      }
      if (!currentPlaylistContext) {
        console.error("[GlobalAudioManager] Cannot playSongAt: No playlist context set."); // Giữ lại lỗi quan trọng
        return;
      }
      if (index < 0 || index >= playlist.length) {
        console.error(`[GlobalAudioManager] Invalid index ${index} for current playlist (length ${playlist.length}).`); // Giữ lại lỗi quan trọng
        return;
      }
  
      const songToPlay = playlist[index];
      if (!songToPlay || !songToPlay.src) {
        console.error(`[GlobalAudioManager] No valid song or song.src found at index ${index}.`); // Giữ lại lỗi quan trọng
        return;
      }
  
      isTransitioning = true;
  
      let audioToUse: HTMLAudioElement;
      const isDifferentSong = currentSong?.id !== songToPlay.id;
      let previousAudioToStop: HTMLAudioElement | null = null;
  
      if (currentAudio) {
        const shouldStopPrevious = isDifferentSong ||
                               (preferredAudioElement && currentAudio !== preferredAudioElement) ||
                               (!preferredAudioElement && !(currentSong?.id === songToPlay.id && !isPlaying));
        if (shouldStopPrevious) {
          previousAudioToStop = currentAudio;
        }
      }
  
      if (preferredAudioElement) {
      console.log('[DEBUGDEBUG][playSongAt] Called with:', { index, playlistLength: playlist.length, currentPlaylistContext, songToPlay });

        const currentSrcOfPreferred = preferredAudioElement.src ? new URL(preferredAudioElement.src, window.location.href).href : "";
        const newSongSrc = new URL(songToPlay.src, window.location.href).href;
        if (currentSrcOfPreferred !== newSongSrc) {
          preferredAudioElement.src = songToPlay.src;
          currentTime = 0; duration = 0; progress = 0; isPlaying = false;
          preferredAudioElement.load();
        }
        audioToUse = preferredAudioElement;
      } else if (currentAudio && currentSong?.id === songToPlay.id && !isPlaying) {
        audioToUse = currentAudio;
        console.log('[DEBUGDEBUG][playSongAt] Using currentAudio:', { src: currentAudio.src });
      } else {
        audioToUse = new Audio(songToPlay.src);
        audioToUse.crossOrigin = "anonymous";
        audioToUse.preload = "auto";
        currentTime = 0; duration = 0; progress = 0; isPlaying = false;
        console.log('[DEBUGDEBUG][playSongAt] Created new Audio:', { src: audioToUse.src });
      }
  
      if (previousAudioToStop) {
        previousAudioToStop.pause();
      }
  
      updateCurrentState(songToPlay, index, currentPlaylistContext, audioToUse);
  
      currentSystem = preferredAudioElement ? "WaveformSystem" : "MainPlayerSystem";
      currentStopFunction = () => {
        if (audioToUse) {
          audioToUse.pause();
        }
      };
      console.log('[DEBUGDEBUG][playSongAt] Ready to play:', {
        src: audioToUse.src,
        readyState: audioToUse.readyState,
        paused: audioToUse.paused,
        currentTime: audioToUse.currentTime
      });
      const playPromise = audioToUse.play();
  
      const cleanupTransition = () => {
        isTransitioning = false;
      };
  
      if (playPromise !== undefined) {
        playPromise.then(() => {
          cleanupTransition();
        }).catch(err => {
          if (err.name === 'AbortError') {
            // console.warn(`[GlobalAudioManager] Playback aborted for Song ID ${songToPlay.id}. Likely interrupted.`);
            if (currentAudio === audioToUse && isPlaying) {
              isPlaying = false;
              notify();
            }
          } else {
            console.error(`🔴 audio.play() failed for Song ID ${songToPlay.id}:`, err); // Giữ lại lỗi quan trọng
            if (currentAudio === audioToUse) {
              isPlaying = false;
              notify();
            }
          }
          cleanupTransition();
        });
      } else {
        console.warn(`[GlobalAudioManager] audio.play() did not return a Promise for Song ID: ${songToPlay.id}.`); // Giữ lại cảnh báo này
        cleanupTransition();
      }
    }
  
  
    async function loadInitialState(fetchPlaylistCallback: (context: PlaylistContext) => Promise<Song[] | null>) {
      const savedContextJson = localStorage.getItem(LS_PLAYLIST_CONTEXT);
      const savedTrackId = localStorage.getItem(LS_TRACK_ID);
      const savedIndexStr = localStorage.getItem(LS_TRACK_INDEX);
      const savedTimeStr = localStorage.getItem(LS_PLAYBACK_TIME);
  
      if (savedContextJson && savedTrackId && savedIndexStr) {
        try {
          const savedContext: PlaylistContext = JSON.parse(savedContextJson);
          const savedIndex = parseInt(savedIndexStr, 10);
          const savedTime = parseFloat(savedTimeStr || '0');
  
          const fetchedPlaylist = await fetchPlaylistCallback(savedContext);
  
          if (fetchedPlaylist && fetchedPlaylist.length > 0) {
            playlist = [...fetchedPlaylist];
            currentPlaylistContext = savedContext;
  
            const initialIndexInFetched = playlist.findIndex(song => String(song.id) === savedTrackId);
            const effectiveInitialIndex = initialIndexInFetched !== -1 ? initialIndexInFetched : (savedIndex >=0 && savedIndex < playlist.length ? savedIndex : -1);
            const initialSong = effectiveInitialIndex !== -1 ? playlist[effectiveInitialIndex] : null;
  
            if (initialSong && initialSong.src) {
              const audio = new Audio(initialSong.src);
              audio.crossOrigin = "anonymous";
              audio.preload = "metadata";

              currentSong = initialSong;
              currentIndex = effectiveInitialIndex;
              isPlaying = false;
              duration = 0; currentTime = 0; progress = 0;
              notifySongChanged();
              notify();

              const handleInitialMetadataLoaded = () => {
                if (audio.duration && savedTime > 0 && savedTime < audio.duration) {
                  audio.currentTime = savedTime;
                }
                updateCurrentState(initialSong, effectiveInitialIndex, savedContext, audio);
                if(isPlaying) {
                  isPlaying = false;
                  notify();
                }
              };
  
              const handleInitialAudioError = (errEvent: Event) => {
                console.error(`[GlobalAudioManager] Error loading initial audio for ${initialSong.src}:`, (errEvent.target as HTMLAudioElement).error); // Giữ lại lỗi quan trọng
                updateCurrentState(null, -1, null, null);
              };
  
              if (audio.readyState >= audio.HAVE_METADATA) {
                handleInitialMetadataLoaded();
              } else {
                audio.addEventListener('loadedmetadata', handleInitialMetadataLoaded, { once: true });
                audio.addEventListener('error', handleInitialAudioError, { once: true });
              }
            } else {
              updateCurrentState(null, -1, null, null);
            }
          } else {
            updateCurrentState(null, -1, null, null);
          }
        } catch (e) {
          console.error("[GlobalAudioManager] Error parsing or processing initial state:", e); // Giữ lại lỗi quan trọng
          updateCurrentState(null, -1, null, null);
        }
      } else {
        updateCurrentState(null, -1, null, null);
      }
    }
    function setShuffle(state: boolean) {
      isShuffle = state;
      notify();
    }

    function toggleShuffle() {
      isShuffle = !isShuffle;
      notify();
    }

    function setRepeat(mode: RepeatMode) {
      repeatMode = mode;
      notify();
    }

    function getRepeat(): RepeatMode {
      return repeatMode;
    }

    function getShuffle(): boolean {
      return isShuffle;
    }
    function playNext() {
      if (!playlist.length) return;

      // 🔁 Lặp lại bài hiện tại
      if (repeatMode === 'one' && currentIndex !== -1) {
        playSongAt(currentIndex);
        return;
      }

      let nextIndex: number;

      // 🔀 Phát ngẫu nhiên
      if (isShuffle) {
        const availableIndexes = playlist
          .map((_, i) => i)
          .filter(i => i !== currentIndex); // tránh trùng bài hiện tại
        nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      } else {
        nextIndex = currentIndex + 1;
      }

      // 🔁 Lặp toàn bộ
      if (nextIndex >= playlist.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // hết bài trong danh sách thì dừng
          if (currentAudio) {
            currentAudio.pause();
          }
          isPlaying = false;
          notify();
          onPlaylistEnded?.();
          return;

          // hết bài thì phát lại bài cuối
          //  nextIndex = playlist.length - 1;
        }
      }

      if (playCallback) {
        playCallback(nextIndex);
      } else {
        playSongAt(nextIndex);
      }
    }

  
    function playPrevious() {
      if (!playlist.length) return;
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        if (currentAudio && currentIndex === 0) {
          currentAudio.currentTime = 0;
          if (!isPlaying) {
            currentAudio.play().catch(e => console.error("[GlobalAudioManager] Error replaying first song:", e)); // Giữ lại lỗi
          }
        }
        return;
      }
      if (playCallback) {
        playCallback(prevIndex);
      } else {
        playSongAt(prevIndex);
      }
    }
  
    function isSamePlaylist(newPlaylist: Song[], newContext?: PlaylistContext) {
      if (!newContext || !currentPlaylistContext) return false; // mới
      if (newContext && currentPlaylistContext) {
        if (newContext.id !== currentPlaylistContext.id || newContext.type !== currentPlaylistContext.type) {
          return false;
        }
      } else if ((newContext && !currentPlaylistContext) || (!newContext && currentPlaylistContext)) {
         return false;
      }
  
      if (playlist.length !== newPlaylist.length) {
        return false;
      }
      return playlist.every((s, i) => s?.id === newPlaylist[i]?.id && s?.src === newPlaylist[i]?.src);
    }
  
    function seekTo(percent: number) {
      if (currentAudio?.duration && !isNaN(currentAudio.duration) && percent >= 0 && percent <= 100) {
        currentAudio.currentTime = (percent / 100) * currentAudio.duration;
      } else {
        // console.warn("[GlobalAudioManager] Cannot seek: No audio, invalid duration, or invalid percent.");
      }
    }
  
    function clearActive(systemName: string) {
      if (currentSystem === systemName) {
        if(currentAudio) {
          currentAudio.pause();
        }
        updateCurrentState(null, -1, null, null);
        currentSystem = null;
        currentStopFunction = null;
      }
    }
  
    function playAudio(audio: HTMLAudioElement, song: Song, context?: PlaylistContext) {
      // console.warn("[GlobalAudioManager] playAudio is for ad-hoc playback. For playlist items, prefer playSongAt.");
  
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
      }
  
      const effectiveContext = context || currentPlaylistContext || { id: song.id || `adhoc-${Date.now()}`, type: 'queue' };
      setActive("AdHocPlayAudioSystem", () => audio.pause(), audio, song, effectiveContext);
  
      audio.play().catch(err => {
        console.error(`🔴 playAudio failed for song ${song.id} (src: ${audio.src}):`, err); // Giữ lại lỗi
        if (currentAudio === audio) {
          isPlaying = false;
          notify();
        }
      });
    }
  
    function pausePlayback() {
      if (isTransitioning) {
        // console.warn("[GlobalAudioManager] pausePlayback ignored: Currently transitioning.");
        return;
      }
      if (currentAudio && isPlaying) {
        currentAudio.pause();
      }
    }
  
    return {
      setActive,
      setPlaylist,
      playSongAt,
      playNext,
      playPrevious,
      subscribe,
      getPlaylist: () => [...playlist],
      getCurrentIndex: () => currentIndex,
      isSamePlaylist,
      getCurrentSystem: () => currentSystem,
      getCurrentAudio: () => currentAudio,
      getCurrentSong: () => currentSong ? { ...currentSong } : null,
      getIsPlaying: () => isPlaying,
      getCurrentTime: () => currentTime,
      getDuration: () => duration,
      getProgress: () => progress,
      getCurrentContext: () => currentPlaylistContext ? { ...currentPlaylistContext } : null,
      seekTo,
      setIsPlaying: (state: boolean) => {
        if (isTransitioning && state) {
            // console.warn("[GlobalAudioManager] setIsPlaying(true) ignored: Currently transitioning.");
            return;
        }
        if (currentAudio) {
          if (state && !isPlaying) {
            currentAudio.play().catch(err => console.error("🔴 setIsPlaying(true) failed:", err)); // Giữ lại lỗi
          } else if (!state && isPlaying) {
            currentAudio.pause();
          }
        } else if (!state && isPlaying) {
          isPlaying = false;
          notify();
        }
      },
      setCurrentIndex: (index: number) => {
        if (index >= 0 && index < playlist.length) {
          if (currentIndex !== index) {
            currentIndex = index;
            saveLastPlayedState();
            notify();
          }
        } else {
          // console.warn(`[GlobalAudioManager] Attempted to set invalid index: ${index}`);
        }
      },
      getPlaylistContainer: () => playlistContainer,
      clearActive,
      getAudioElement: () => currentAudio,
      playAudio,
      pausePlayback,
      loadInitialState,
      setShuffle,
      toggleShuffle,
      setRepeat,
      getRepeat,
      getShuffle
    };
  })();
  
  declare global {
    interface Window {
      GlobalAudioManager: IGlobalAudioManager;
    }
  }
  
  if (typeof window !== "undefined") {
    window.GlobalAudioManager = GlobalAudioManager;
  }
  
  export default GlobalAudioManager;
  
  export const notifySongChanged = () => {
    if (window.GlobalAudioManager && GlobalAudioManager.getCurrentSong()) {
      window.dispatchEvent(new CustomEvent("songchanged", {
        detail: {
          song: GlobalAudioManager.getCurrentSong(),
          context: GlobalAudioManager.getCurrentContext()
        }
      }));
    }
  };
 