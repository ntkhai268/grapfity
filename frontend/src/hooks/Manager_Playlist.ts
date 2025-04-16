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
    waveColor: "#a9a9a9",
    progressColor: "#fff",
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

  const currentTrackIndex = playlistData?.tracks.findIndex((track) => track.src === src);
  if (!playlistData || currentTrackIndex === undefined) return;

  const songs: Song[] = playlistData.tracks.map((track) => ({
    src: track.src,
    title: track.title,
    artist: playlistData.artist,
    cover,
  }));

  const currentSong = GlobalAudioManager.getCurrentSong();
  const currentAudio = GlobalAudioManager.getCurrentAudio();

  if (currentSong?.src === src) {
    currentAudio?.paused ? currentAudio.play() : currentAudio?.pause();
    return;
  }

  GlobalAudioManager.setPlaylist(songs, currentTrackIndex, null, playlistContainer);
  GlobalAudioManager.playSongAt(currentTrackIndex);
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

    tempAudio.addEventListener("loadedmetadata", () => {
      renderWaveform(tempAudio, waveformContainer);
    });
  });
};

const handleSongChanged = () => {
  console.log("🎧 songchanged event fired!");

  const container = GlobalAudioManager.getPlaylistContainer();
  if (!container) return console.log("⛔ No playlist container found");

  const waveformContainer = container.querySelector(".waveform .audio-playlist") as HTMLDivElement | null;
  const audio = GlobalAudioManager.getCurrentAudio();
  const song = GlobalAudioManager.getCurrentSong();

  if (!waveformContainer || !audio || !song) return console.log("⛔ Missing waveform container, audio or song");

  const existing = waveformMap.get(waveformContainer);
  if (existing?.src === song.src) return;

  if (audio.readyState >= 1) {
    console.log("🔄 Rendering new waveform for:", song.title || song.src);
    renderWaveform(audio, waveformContainer);
  } else {
    audio.addEventListener("loadedmetadata", () => {
      console.log("🔄 Rendering new waveform after metadata load:", song.title || song.src);
      renderWaveform(audio, waveformContainer);
    }, { once: true });
  }
};

window.addEventListener("songchanged", handleSongChanged);
