import WaveSurfer from 'wavesurfer.js';
// Import các kiểu dữ liệu cần thiết từ GlobalAudioManager
// Đảm bảo đường dẫn này chính xác đến file GlobalAudioManager đã được sửa đổi
import GlobalAudioManager, { Song, PlaylistContext } from './GlobalAudioManager';

const waveTracks: { [key: string]: WaveSurfer } = {}; // Lưu các instance WaveSurfer theo src
const waveTrackSubscriptions: { [key: string]: (() => void)[] } = {}; // Lưu các hàm unsubscribe cho mỗi track

function cleanupWaveTrack(src: string) {
  if (waveTracks[src]) {
    try {
      waveTracks[src].destroy();
    //   console.log(`[WaveForm] Destroyed WaveSurfer for: ${src}`);
    } catch (e) {
    //   console.error(`[WaveForm] Error destroying WaveSurfer for ${src}:`, e);
    }
    delete waveTracks[src];
  }
  if (waveTrackSubscriptions[src]) {
    waveTrackSubscriptions[src].forEach(unsubscribe => unsubscribe());
    delete waveTrackSubscriptions[src];
    // console.log(`[WaveForm] Unsubscribed listeners for: ${src}`);
  }
}

// HÀM MỚI: Đảm bảo WaveSurfer được tạo/tìm thấy và yêu cầu GAM phát nó
function ensureAndPlayWaveformTrack(songIndex: number, currentPlaylist: Song[], playlistContext: PlaylistContext) {
//   console.log(`[WaveForm] ensureAndPlayWaveformTrack called for index: ${songIndex}`);
  if (songIndex < 0 || songIndex >= currentPlaylist.length) {
    // console.error(`[WaveForm] Invalid songIndex in ensureAndPlayWaveformTrack: ${songIndex}`);
    return;
  }

  const songToPlay = currentPlaylist[songIndex];
  if (!songToPlay || !songToPlay.src) {
    // console.error(`[WaveForm] No song or src found at index ${songIndex} in ensureAndPlayWaveformTrack.`);
    return;
  }

  const songElement = document.querySelector(`.content.active .song[data-src="${songToPlay.src}"]`.trim());
  if (!songElement) {
    // console.warn(`[WaveForm] Could not find songElement for src: ${songToPlay.src} in ensureAndPlayWaveformTrack. GAM will play audio only.`);
    GlobalAudioManager.playSongAt(songIndex);
    return;
  }

  const audioContainer = songElement.querySelector<HTMLElement>(".audio");
  const playButton = songElement.querySelector<HTMLImageElement>(".play_button img");

  if (!audioContainer || !playButton) {
    // console.warn(`[WaveForm] Missing audioContainer or playButton for src: ${songToPlay.src} in ensureAndPlayWaveformTrack. GAM will play audio only.`);
    GlobalAudioManager.playSongAt(songIndex);
    return;
  }

  let waveTrackInstance = waveTracks[songToPlay.src];
  let mediaElementForGAM: HTMLAudioElement | undefined;

  if (waveTrackInstance) {
    // console.log(`[WaveForm] Found existing WaveSurfer for track: ${songToPlay.src}`);
    mediaElementForGAM = waveTrackInstance.getMediaElement() as HTMLAudioElement;
    if (!playButton.dataset.subscribedWaveform) {
        // console.log(`[WaveForm] Re-attaching listeners for existing track: ${songToPlay.title}`);
        attachPlayButtonListenerAndSubscribe(playButton, waveTrackInstance, songToPlay, currentPlaylist, songIndex, playlistContext);
    }
  } else {
    // console.log(`[WaveForm] Creating new WaveSurfer for track: ${songToPlay.src}`);
    const newMediaElement = new Audio(songToPlay.src);
    newMediaElement.crossOrigin = "anonymous";
    newMediaElement.preload = "metadata";

    try {
      waveTrackInstance = WaveSurfer.create({
        container: audioContainer,
        waveColor: '#808080',
        progressColor: '#fff',
        barWidth: 2,
        height: 50,
        mediaControls: false,
        backend: "MediaElement",
        media: newMediaElement,
      });
      waveTracks[songToPlay.src] = waveTrackInstance;
      if (!waveTrackSubscriptions[songToPlay.src]) {
        waveTrackSubscriptions[songToPlay.src] = [];
      }
      attachPlayButtonListenerAndSubscribe(playButton, waveTrackInstance, songToPlay, currentPlaylist, songIndex, playlistContext);
      mediaElementForGAM = newMediaElement;
    //   console.log(`✅ New WaveSurfer object created via ensureAndPlay for: ${songToPlay.title || songToPlay.src}`);
    } catch (error) {
    //   console.error(`[WaveForm] Error creating WaveSurfer in ensureAndPlay for ${songToPlay.src}:`, error);
      if (audioContainer) audioContainer.innerHTML = '<p class="text-red-500 text-xs">Error loading waveform.</p>';
      GlobalAudioManager.playSongAt(songIndex);
      return;
    }
  }
  
  if (mediaElementForGAM) {
    // console.log(`[WaveForm] Calling GlobalAudioManager.playSongAt(${songIndex}, with preferredAudio) for ${songToPlay.src}`);
    GlobalAudioManager.playSongAt(songIndex, mediaElementForGAM);
  } else {
    console.warn(`[WaveForm] No mediaElementForGAM found for ${songToPlay.src}, calling playSongAt without preferredAudio.`);
    GlobalAudioManager.playSongAt(songIndex);
  }
}


function initWaveSurfer(): void {
//   console.log("[WaveForm] initWaveSurfer called");
  const globalCurrentSong = GlobalAudioManager.getCurrentSong();
  const globalIsPlaying = GlobalAudioManager.getIsPlaying();
  console.log("[WaveForm] Initial Global State:", {
    songId: globalCurrentSong?.id,
    isPlaying: globalIsPlaying,
  });

  const activeContent = document.querySelector(".content.active");
  if (!activeContent) {
    console.warn("[WaveForm] No .content.active element found. Skipping WaveSurfer initialization.");
    Object.keys(waveTracks).forEach(cleanupWaveTrack);
    return;
  }

  const songElements = Array.from(activeContent.querySelectorAll(".song"));
//   console.log(`[WaveForm] Found ${songElements.length} song elements in .content.active (ID: ${activeContent.id || 'N/A'})`);

  if (songElements.length === 0) {
    // console.warn("[WaveForm] No active song elements found. WaveSurfer initialization skipped.");
    Object.keys(waveTracks).forEach(cleanupWaveTrack);
    return;
  }

  const playlist: Song[] = songElements.map((el) => {
    const idAttr = el.getAttribute("data-id");
    const songId = idAttr ? (isNaN(Number(idAttr)) ? idAttr : Number(idAttr)) : `unknown-id-${Math.random().toString(36).substring(7)}`;
    return {
      id: songId,
      title: el.getAttribute("data-title") || "Không rõ tiêu đề",
      artist: el.getAttribute("data-artist") || "Không rõ ca sĩ",
      cover: el.getAttribute("data-cover") || "assets/anhmau.png",
      src: el.getAttribute("data-src")!.trim(),
    };
  }).filter(song => !!song.src);

  if (playlist.length === 0) {
    // console.warn("[WaveForm] No songs with data-src found in active content. Cleaning up old tracks.");
    Object.keys(waveTracks).forEach(cleanupWaveTrack);
    return;
  }

  const waveformPlaylistContext: PlaylistContext = {
    id: 'active-waveform-list-' + (activeContent.id || 'default'),
    type: 'waveform'
  };
  try {
  localStorage.setItem("lastWaveformPlaylist", JSON.stringify(playlist));
  localStorage.setItem("lastWaveformContext", JSON.stringify(waveformPlaylistContext));
  console.log("[WaveForm] Stored waveform context and playlist into localStorage.");
} catch (err) {
  console.error("[WaveForm] Failed to save playlist to localStorage:", err);
}

  const currentSrcList: string[] = playlist.map(song => song.src);

  Object.keys(waveTracks).forEach(src => {
    if (!currentSrcList.includes(src)) {
      cleanupWaveTrack(src);
    }
  });

  songElements.forEach((songElement, index) => {
    const audioContainer = songElement.querySelector<HTMLElement>(".audio");
    const playButton = songElement.querySelector<HTMLImageElement>(".play_button img");
    const songSrc = songElement.getAttribute("data-src")?.trim();

    if (!audioContainer || !playButton || !songSrc) {
    //   console.warn(`[WaveForm] Skipping song index ${index}: Missing container, button, or src.`);
      return;
    }

    const song = playlist[index];
     if (!song) {
        // console.warn(`[WaveForm] No song data found in playlist for src: ${songSrc} at index ${index}`);
        return;
    }

    if (waveTracks[songSrc]) {
      if (!playButton.dataset.subscribedWaveform) {
        // console.log(`[WaveForm] Re-attaching listener for existing WaveSurfer: ${songSrc}`);
        attachPlayButtonListenerAndSubscribe(playButton, waveTracks[songSrc], song, playlist, index, waveformPlaylistContext);
      }
      return;
    }

    const mediaElementForWaveSurfer = new Audio(songSrc);
    mediaElementForWaveSurfer.crossOrigin = "anonymous";
    mediaElementForWaveSurfer.preload = "metadata";

    let waveTrack: WaveSurfer | null = null;
    try {
      waveTrack = WaveSurfer.create({
        container: audioContainer,
        waveColor: '#808080',
        progressColor: '#fff',
        barWidth: 2,
        height: 50,
        mediaControls: false,
        backend: "MediaElement",
        media: mediaElementForWaveSurfer,
      });
    //   console.log(`[WaveForm] WaveSurfer instance created for ${songSrc}`);
    } catch (error) {
    //   console.error(`[WaveForm] Error creating WaveSurfer for ${songSrc}:`, error);
      if (audioContainer) audioContainer.innerHTML = '<p class="text-red-500 text-xs">Error loading waveform.</p>';
      return;
    }

    waveTracks[songSrc] = waveTrack;
    if (!waveTrackSubscriptions[songSrc]) {
        waveTrackSubscriptions[songSrc] = [];
    }

    attachPlayButtonListenerAndSubscribe(playButton, waveTrack, song, playlist, index, waveformPlaylistContext);

    // console.log(`✅ WaveSurfer object created for: ${song?.title || songSrc}`);
  });
}


function attachPlayButtonListenerAndSubscribe(
  playButton: HTMLImageElement,
  waveTrack: WaveSurfer,
  song: Song,
  playlistContextArr: Song[],
  indexInPlaylist: number,
  context: PlaylistContext
) {
  const playButtonContainer = playButton.closest(".play_button");
  if (!playButtonContainer) {
    // console.warn(`[WaveForm] Could not find .play_button container for song: ${song.title}`);
    return;
  }

  const oldListenerKey = '__waveformClickListener';
  if ((playButtonContainer as any)[oldListenerKey]) {
    playButtonContainer.removeEventListener("click", (playButtonContainer as any)[oldListenerKey]);
  }

  const newListener = () => {
    // console.log(`[WaveForm] Play button clicked for song ID: ${song.id}, Title: ${song.title}`);
    const mediaElement = waveTrack.getMediaElement() as HTMLAudioElement | null;
    if (!mediaElement) {
    //   console.error("[WaveForm] Cannot interact: Media element not found in WaveSurfer instance for song:", song.id);
      return;
    }

    const activeContentElement = playButtonContainer.closest(".content");
    if (!activeContentElement || !activeContentElement.classList.contains("active")) {
    //   console.log("[WaveForm] Click ignored: Tab/content area is not active.");
      return;
    }

    const globalSong = GlobalAudioManager.getCurrentSong();
    const globalIsPlaying = GlobalAudioManager.getIsPlaying();
    const globalAudio = GlobalAudioManager.getCurrentAudio();

    if (globalSong?.id === song.id && globalIsPlaying && globalAudio === mediaElement) {
    //   console.log("[WaveForm] Requesting GAM to pause (was playing this waveform).");
      GlobalAudioManager.pausePlayback();
      return;
    }

    if (globalSong?.id === song.id && (!globalIsPlaying || globalAudio !== mediaElement) ) {
    //   console.log("[WaveForm] Requesting GAM to play/resume (song is current, but not playing via this waveform's audio or paused).");
      GlobalAudioManager.playSongAt(indexInPlaylist, mediaElement);
      return;
    }

    // console.log(`[WaveForm] Requesting GAM to play new/different song: ${song.title} (ID: ${song.id}) at index ${indexInPlaylist}`);
    
    // MODIFIED: Dừng và RESET VỊ TRÍ của các WaveSurfer khác khi bài mới được CHỦ ĐỘNG phát từ đây
    Object.entries(waveTracks).forEach(([src, otherTrack]) => {
      if (src !== song.src) { // Áp dụng cho tất cả các track khác với track đang được click
        if (otherTrack.isPlaying()) {
          otherTrack.pause(); 
        }
        if (otherTrack.getDuration() > 0) { // Chỉ seek nếu đã load và không phải là track sắp phát
          otherTrack.seekTo(0); // Đưa waveform về đầu
        //   console.log(`[WaveForm] Resetting position for other track (on new play): ${src}`);
        }
      }
    });

    const playFnForSetPlaylist = (nextSongIndex: number) => {
        // console.log(`[WaveForm] playFn (from setPlaylist) called for nextIndex: ${nextSongIndex}`);
        ensureAndPlayWaveformTrack(nextSongIndex, playlistContextArr, context);
    };

    if (!GlobalAudioManager.isSamePlaylist(playlistContextArr, context) || GlobalAudioManager.getCurrentContext()?.id !== context.id) {
    //   console.log("[WaveForm] Context/Playlist differs or not set in GAM. Calling setPlaylist.");
      GlobalAudioManager.setPlaylist(
        playlistContextArr,
        indexInPlaylist,
        context,
        playFnForSetPlaylist
      );
      GlobalAudioManager.playSongAt(indexInPlaylist, mediaElement);
    } else {
    //   console.log("[WaveForm] Playlist context in GAM is already the same. Directly calling playSongAt.");
      GlobalAudioManager.playSongAt(indexInPlaylist, mediaElement);
    }
  };

  playButtonContainer.addEventListener("click", newListener);
  (playButtonContainer as any)[oldListenerKey] = newListener;
  playButton.dataset.subscribedWaveform = "true";

  const updateButtonVisualState = () => {
    const currentGlobalSong = GlobalAudioManager.getCurrentSong();
    const currentGlobalIsPlaying = GlobalAudioManager.getIsPlaying();
    const currentGlobalAudio = GlobalAudioManager.getCurrentAudio();
    const thisWaveformMediaElement = waveTrack.getMediaElement();

    const isActiveAndPlayingThisTrack =
      currentGlobalSong?.id === song.id &&
      currentGlobalIsPlaying &&
      currentGlobalAudio === thisWaveformMediaElement;

    playButton.src = isActiveAndPlayingThisTrack ? "/assets/stop.png" : "/assets/play.png";

    // MODIFIED: Reset vị trí của waveform này NẾU nó KHÔNG PHẢI là bài hát toàn cục đang được phát qua chính audio của nó
    if (waveTrack.getDuration() > 0) { // Chỉ reset nếu waveform đã load
      if (!isActiveAndPlayingThisTrack) {
        // Nếu track này không phải là track đang phát toàn cục qua chính audio element của nó,
        // thì reset vị trí của nó.
        if (waveTrack.isPlaying()) { // Dừng nếu nó đang tự phát mà không phải là global audio
            waveTrack.pause();
        }
        waveTrack.seekTo(0);
        // console.log(`[WaveForm] Resetting non-active track ${song.src} (src: ${song.src}) via updateButtonVisualState because isActiveAndPlayingThisTrack is false.`);
      }
    }
  };

  updateButtonVisualState();
  const unsubscribeGam = GlobalAudioManager.subscribe(updateButtonVisualState);

  if (!waveTrackSubscriptions[song.src]) {
    waveTrackSubscriptions[song.src] = [];
  }
  waveTrackSubscriptions[song.src].push(unsubscribeGam);

  const handleWaveSurferPlay = () => {
    const mediaEl = waveTrack.getMediaElement() as HTMLAudioElement;
    if (GlobalAudioManager.getCurrentAudio() !== mediaEl || !GlobalAudioManager.getIsPlaying()) {
        // console.log(`[WaveForm] WaveSurfer for ${song.id} started playing (direct interaction). Syncing with GAM.`);
        if (!GlobalAudioManager.isSamePlaylist(playlistContextArr, context) || GlobalAudioManager.getCurrentContext()?.id !== context.id) {
            GlobalAudioManager.setPlaylist(playlistContextArr, indexInPlaylist, context, (nextIdx) => ensureAndPlayWaveformTrack(nextIdx, playlistContextArr, context));
        }
        GlobalAudioManager.playSongAt(indexInPlaylist, mediaEl);
    }
  };
  const handleWaveSurferPause = () => {
    const mediaEl = waveTrack.getMediaElement();
    if (GlobalAudioManager.getCurrentAudio() === mediaEl && GlobalAudioManager.getIsPlaying()) {
        // console.log(`[WaveForm] WaveSurfer for ${song.id} paused (direct interaction). Syncing with GAM.`);
        GlobalAudioManager.pausePlayback();
    }
  };

  waveTrack.on('play', handleWaveSurferPlay);
  waveTrack.on('pause', handleWaveSurferPause);

   waveTrackSubscriptions[song.src].push(() => waveTrack.un('play', handleWaveSurferPlay));
   waveTrackSubscriptions[song.src].push(() => waveTrack.un('pause', handleWaveSurferPause));
}

let initTimeoutId: number | null = null;

function initializeWaveformsWithDebounce() {
  if (initTimeoutId !== null) {
    clearTimeout(initTimeoutId);
  }
  initTimeoutId = window.setTimeout(() => {
    initWaveSurfer();
    initTimeoutId = null;
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  initializeWaveformsWithDebounce();
});

function cleanupAllWaveforms() {
    // console.log("[WaveForm] cleanupAllWaveforms called. Destroying all WaveSurfer instances.");
    Object.keys(waveTracks).forEach(cleanupWaveTrack);
}

export { initWaveSurfer, initializeWaveformsWithDebounce, cleanupAllWaveforms };

