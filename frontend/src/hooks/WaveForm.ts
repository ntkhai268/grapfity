import WaveSurfer from 'wavesurfer.js';
import GlobalAudioManager, { Song, PlaylistContext } from './GlobalAudioManager';

const waveTracks: { [key: string]: WaveSurfer } = {};
const waveTrackSubscriptions: { [key: string]: (() => void)[] } = {};

function makeWaveTrackKey(src: string, contextId: string | number) {
  return `${src}|${contextId}`;
}

function cleanupWaveTrack(src: string, contextId: string | number) {
  const key = makeWaveTrackKey(src, contextId);
  if (waveTracks[key]) {
    try { waveTracks[key].destroy(); } catch (e) {}
    delete waveTracks[key];
  }
  if (waveTrackSubscriptions[key]) {
    waveTrackSubscriptions[key].forEach(unsubscribe => unsubscribe());
    delete waveTrackSubscriptions[key];
  }
}

// Đảm bảo tạo instance đúng context, đúng key
function ensureAndPlayWaveformTrack(songIndex: number, currentPlaylist: Song[], playlistContext: PlaylistContext) {
  if (songIndex < 0 || songIndex >= currentPlaylist.length) return;

  const songToPlay = currentPlaylist[songIndex];
  if (!songToPlay || !songToPlay.src) return;

  const key = makeWaveTrackKey(songToPlay.src, playlistContext.id);

  const songElement = document.querySelector(`.content.active .song[data-src="${songToPlay.src}"]`.trim());
  if (!songElement) {
    GlobalAudioManager.playSongAt(songIndex);
    return;
  }

  const audioContainer = songElement.querySelector<HTMLElement>(".audio");
  const playButton = songElement.querySelector<HTMLImageElement>(".play_button img");

  if (!audioContainer || !playButton) {
    GlobalAudioManager.playSongAt(songIndex);
    return;
  }

  let waveTrackInstance = waveTracks[key];
  let mediaElementForGAM: HTMLAudioElement | undefined;

  if (waveTrackInstance) {
    mediaElementForGAM = waveTrackInstance.getMediaElement() as HTMLAudioElement;
    if (!playButton.dataset.subscribedWaveform) {
      attachPlayButtonListenerAndSubscribe(playButton, waveTrackInstance, songToPlay, currentPlaylist, songIndex, playlistContext);
    }
  } else {
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
      waveTracks[key] = waveTrackInstance;
      if (!waveTrackSubscriptions[key]) waveTrackSubscriptions[key] = [];
      attachPlayButtonListenerAndSubscribe(playButton, waveTrackInstance, songToPlay, currentPlaylist, songIndex, playlistContext);
      mediaElementForGAM = newMediaElement;
    } catch (error) {
      if (audioContainer) audioContainer.innerHTML = '<p class="text-red-500 text-xs">Error loading waveform.</p>';
      GlobalAudioManager.playSongAt(songIndex);
      return;
    }
  }

  if (mediaElementForGAM) {
    GlobalAudioManager.playSongAt(songIndex, mediaElementForGAM);
  } else {
    GlobalAudioManager.playSongAt(songIndex);
  }
}

function initWaveSurfer(): void {
  const activeContent = document.querySelector(".content.active");
  if (!activeContent) {
    Object.keys(waveTracks).forEach(key => {
      const [src, contextId] = key.split('|');
      cleanupWaveTrack(src, contextId);
    });
    return;
  }

  const songElements = Array.from(activeContent.querySelectorAll(".song"));
  if (songElements.length === 0) {
    Object.keys(waveTracks).forEach(key => {
      const [src, contextId] = key.split('|');
      cleanupWaveTrack(src, contextId);
    });
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
    Object.keys(waveTracks).forEach(key => {
      const [src, contextId] = key.split('|');
      cleanupWaveTrack(src, contextId);
    });
    return;
  }

  // Xác định contextId cho từng section/tab
  const classList = activeContent.classList;
  let contextId = 'default';
  if (classList.contains('popular')) contextId = 'popular';
  else if (classList.contains('all')) contextId = 'all';
  else if (classList.contains('track')) contextId = 'track';
  else if (classList.contains('playlist')) contextId = 'playlist';
  else if (activeContent.id) contextId = activeContent.id;

  const waveformPlaylistContext: PlaylistContext = {
    id: contextId,
    type: 'waveform'
  };
  try {
    localStorage.setItem("lastWaveformPlaylist", JSON.stringify(playlist));
    localStorage.setItem("lastWaveformContext", JSON.stringify(waveformPlaylistContext));
  } catch (err) {}

  const currentSrcList: string[] = playlist.map(song => song.src);

  // Cleanup instance chỉ của contextId này thôi!
  Object.keys(waveTracks).forEach(key => {
    const [src, cId] = key.split('|');
    if (cId === contextId && !currentSrcList.includes(src)) {
      cleanupWaveTrack(src, cId);
    }
  });

  songElements.forEach((songElement, index) => {
    const audioContainer = songElement.querySelector<HTMLElement>(".audio");
    const playButton = songElement.querySelector<HTMLImageElement>(".play_button img");
    const songSrc = songElement.getAttribute("data-src")?.trim();
    if (!audioContainer || !playButton || !songSrc) return;
    const song = playlist[index];
    if (!song) return;

    const key = makeWaveTrackKey(songSrc, contextId);

    if (waveTracks[key]) {
      if (!playButton.dataset.subscribedWaveform) {
        attachPlayButtonListenerAndSubscribe(playButton, waveTracks[key], song, playlist, index, waveformPlaylistContext);
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
        height: 80,
        mediaControls: false,
        backend: "MediaElement",
        media: mediaElementForWaveSurfer,
      });
    } catch (error) {
      if (audioContainer) audioContainer.innerHTML = '<p class="text-red-500 text-xs">Error loading waveform.</p>';
      return;
    }

    waveTracks[key] = waveTrack;
    if (!waveTrackSubscriptions[key]) waveTrackSubscriptions[key] = [];
    attachPlayButtonListenerAndSubscribe(playButton, waveTrack, song, playlist, index, waveformPlaylistContext);
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
  const key = makeWaveTrackKey(song.src, context.id);
  const playButtonContainer = playButton.closest(".play_button");
  if (!playButtonContainer) return;

  const oldListenerKey = '__waveformClickListener';
  if ((playButtonContainer as any)[oldListenerKey]) {
    playButtonContainer.removeEventListener("click", (playButtonContainer as any)[oldListenerKey]);
  }

  const newListener = () => {
    const mediaElement = waveTrack.getMediaElement() as HTMLAudioElement | null;
    if (!mediaElement) return;

    const activeContentElement = playButtonContainer.closest(".content");
    if (!activeContentElement || !activeContentElement.classList.contains("active")) return;

    const globalSong = GlobalAudioManager.getCurrentSong();
    const globalIsPlaying = GlobalAudioManager.getIsPlaying();
    const globalAudio = GlobalAudioManager.getCurrentAudio();

    if (globalSong?.id === song.id && globalIsPlaying && globalAudio === mediaElement) {
      GlobalAudioManager.pausePlayback();
      return;
    }
    if (globalSong?.id === song.id && (!globalIsPlaying || globalAudio !== mediaElement)) {
      GlobalAudioManager.playSongAt(indexInPlaylist, mediaElement);
      return;
    }

    Object.entries(waveTracks).forEach(([k, otherTrack]) => {
      if (k !== key) {
        if (otherTrack.isPlaying()) otherTrack.pause();
        if (otherTrack.getDuration() > 0) otherTrack.seekTo(0);
      }
    });

    const playFnForSetPlaylist = (nextSongIndex: number) => {
      ensureAndPlayWaveformTrack(nextSongIndex, playlistContextArr, context);
    };

    if (!GlobalAudioManager.isSamePlaylist(playlistContextArr, context) || GlobalAudioManager.getCurrentContext()?.id !== context.id) {
      GlobalAudioManager.setPlaylist(
        playlistContextArr,
        indexInPlaylist,
        context,
        playFnForSetPlaylist
      );
      GlobalAudioManager.playSongAt(indexInPlaylist, mediaElement);
    } else {
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

    if (waveTrack.getDuration() > 0) {
      if (!isActiveAndPlayingThisTrack) {
        if (waveTrack.isPlaying()) waveTrack.pause();
        waveTrack.seekTo(0);
      }
    }
  };

  updateButtonVisualState();
  const unsubscribeGam = GlobalAudioManager.subscribe(updateButtonVisualState);

  if (!waveTrackSubscriptions[key]) waveTrackSubscriptions[key] = [];
  waveTrackSubscriptions[key].push(unsubscribeGam);

  const handleWaveSurferPlay = () => {
    const mediaEl = waveTrack.getMediaElement() as HTMLAudioElement;
    if (GlobalAudioManager.getCurrentAudio() !== mediaEl || !GlobalAudioManager.getIsPlaying()) {
      if (!GlobalAudioManager.isSamePlaylist(playlistContextArr, context) || GlobalAudioManager.getCurrentContext()?.id !== context.id) {
        GlobalAudioManager.setPlaylist(playlistContextArr, indexInPlaylist, context, (nextIdx) => ensureAndPlayWaveformTrack(nextIdx, playlistContextArr, context));
      }
      GlobalAudioManager.playSongAt(indexInPlaylist, mediaEl);
    }
  };
  const handleWaveSurferPause = () => {
    const mediaEl = waveTrack.getMediaElement();
    if (GlobalAudioManager.getCurrentAudio() === mediaEl && GlobalAudioManager.getIsPlaying()) {
      GlobalAudioManager.pausePlayback();
    }
  };

  // waveTrack.on('play', handleWaveSurferPlay);
  // waveTrack.on('pause', handleWaveSurferPause);

  waveTrackSubscriptions[key].push(() => waveTrack.un('play', handleWaveSurferPlay));
  waveTrackSubscriptions[key].push(() => waveTrack.un('pause', handleWaveSurferPause));
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
  Object.keys(waveTracks).forEach(key => {
    const [src, contextId] = key.split('|');
    cleanupWaveTrack(src, contextId);
  });
}

export { initWaveSurfer, initializeWaveformsWithDebounce, cleanupAllWaveforms, ensureAndPlayWaveformTrack };
