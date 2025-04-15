import GlobalAudioManager, { Song } from "../hooks/GlobalAudioManager";
import React from "react";
import WaveSurfer from "wavesurfer.js";

const waveformMap = new Map<HTMLDivElement, { waveSurfer: WaveSurfer; src: string }>();

const renderWaveform = (audio: HTMLAudioElement, container: HTMLDivElement) => {
  const existing = waveformMap.get(container);
  if (existing) {
    existing.waveSurfer.destroy();
  }

  const waveSurfer = WaveSurfer.create({
    container,
    waveColor: "#fff",
    progressColor: "#383351",
    cursorColor: "white",
    barWidth: 2,
    height: 50,
    media: audio,
    backend: "MediaElement",
  });

  waveformMap.set(container, { waveSurfer, src: audio.src });

  (waveSurfer as any).on("seek", (progress: number) => {
    if (!isNaN(progress)) {
      GlobalAudioManager.seekTo(progress * 100);
    }
  });

  audio.onended = () => {
    GlobalAudioManager.playNext();
    setTimeout(() => {
      const nextAudio = GlobalAudioManager.getCurrentAudio();
      const nextSong = GlobalAudioManager.getCurrentSong();
      if (!nextAudio || !nextSong || !container) return;
      renderWaveform(nextAudio, container);
    }, 200);
  };
};

const handlePlayTrack = (event: React.MouseEvent<HTMLDivElement>) => {
  const trackItem = event.currentTarget.closest(".track-item") as HTMLDivElement | null;
  if (!trackItem) return;

  const src = trackItem.dataset.src;
  const cover = trackItem.dataset.cover || "assets/anhmau.png";
  if (!src) return;

  const playlistContainer = trackItem.closest(".player-container") as HTMLDivElement | null;
  const playlistData = playlistContainer?.dataset.playlist
    ? (JSON.parse(playlistContainer.dataset.playlist) as {
        title: string;
        artist: string;
        timeAgo: string;
        tracks: { title: string; src: string; plays: string }[];
      })
    : null;

  const currentTrackIndexInPlaylist = playlistData?.tracks.findIndex((track) => track.src === src);
  if (!playlistData || currentTrackIndexInPlaylist === undefined) return;

  const songsInPlaylist: Song[] = playlistData.tracks.map((track) => ({
    src: track.src,
    title: track.title,
    artist: playlistData.artist,
    cover,
  }));

  const currentSong = GlobalAudioManager.getCurrentSong();
  const currentAudio = GlobalAudioManager.getCurrentAudio();

  if (currentSong?.src === src) {
    // Nếu đang phát bài này → chỉ toggle play/pause
    if (currentAudio?.paused) {
      currentAudio.play();
    } else {
      currentAudio?.pause();
    }
    return; // Không render waveform lại!
  }

  // Nếu là bài mới → phát bài đó và render waveform
  GlobalAudioManager.setPlaylist(songsInPlaylist, currentTrackIndexInPlaylist);
  GlobalAudioManager.playSongAt(currentTrackIndexInPlaylist);

  const waveformContainer = playlistContainer?.querySelector(".waveform .audio-playlist") as HTMLDivElement | null;
  if (!waveformContainer) return;

  setTimeout(() => {
    const audio = GlobalAudioManager.getCurrentAudio();
    const updatedSong = GlobalAudioManager.getCurrentSong();
    if (!audio || !updatedSong) return;

    const existing = waveformMap.get(waveformContainer);
    if (existing?.src === updatedSong.src) return; // Đã có waveform rồi

    renderWaveform(audio, waveformContainer);
  }, 200);
};

export default handlePlayTrack;

export const initFirstWaveforms = () => {
    const containers = document.querySelectorAll(".player-container");
  
    containers.forEach((container) => {
      const playlistDataAttr = container.getAttribute("data-playlist");
      if (!playlistDataAttr) return;
  
      const playlistData = JSON.parse(playlistDataAttr);
      const firstTrack = playlistData?.tracks?.[0];
      if (!firstTrack) return;
  
      const waveformContainer = container.querySelector(".waveform .audio-playlist") as HTMLDivElement | null;
      if (!waveformContainer) return;
  
      const tempAudio = new Audio(firstTrack.src);
      tempAudio.crossOrigin = "anonymous";
  
      renderWaveform(tempAudio, waveformContainer);
    });
  };

  const handleSongChanged = () => {
  const container = GlobalAudioManager.getPlaylistContainer();
  if (!container) return;

  const waveformContainer = container.querySelector(".waveform .audio-playlist") as HTMLDivElement | null;
  const audio = GlobalAudioManager.getCurrentAudio();
  const song = GlobalAudioManager.getCurrentSong();

  if (!waveformContainer || !audio || !song) return;

  const existing = waveformMap.get(waveformContainer);
  if (existing?.src === song.src) return;

  renderWaveform(audio, waveformContainer);
};

window.addEventListener("songchanged", handleSongChanged);