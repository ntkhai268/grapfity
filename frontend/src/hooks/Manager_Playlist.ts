import GlobalAudioManager, { Song } from "../hooks/GlobalAudioManager";

import WaveSurfer from "wavesurfer.js";

// Define types from Playlist.tsx if not already shared
interface TrackItem {
    id: number | string;
    title: string;
    src: string;
    artist: string;
    cover: string;
}
interface PlaylistData {
    id: number;
    title: string;
    artist: string; // Artist of the playlist creator
    timeAgo: string;
    cover: string | null;
    tracks: TrackItem[];
}


// Map to store WaveSurfer instances (keep as is for now)
const waveformMap = new Map<HTMLDivElement, { waveSurfer: WaveSurfer; src: string }>();

// renderWaveform function (keep as is for now)
const renderWaveform = (audio: HTMLAudioElement, container: HTMLDivElement) => {
    // ... (keep existing logic) ...
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

// playNextPlaylist function (Needs refactoring later, relies on data-playlist)
const playNextPlaylist = (currentContainer: HTMLDivElement) => {
    console.warn("playNextPlaylist needs refactoring - currently relies on data-playlist");
    // ... (keep existing logic for now, but it will likely fail) ...
     const allContainers = Array.from(document.querySelectorAll(".player-container")) as HTMLDivElement[];
     const currentIndex = allContainers.findIndex((el) => el === currentContainer);
     const nextContainer = allContainers[currentIndex + 1];
     if (!nextContainer) return console.log("⛔ Không có playlist tiếp theo");

     // This part will fail as data-playlist is removed
     const nextData = nextContainer.getAttribute("data-playlist");
     if (!nextData) return;

     const playlistData = JSON.parse(nextData);
     const firstTrack = playlistData.tracks?.[0];
     if (!firstTrack) return;

     const songs: Song[] = playlistData.tracks.map((track: any) => ({
       src: track.src,
       title: track.title,
       artist: playlistData.artist, // Use playlist artist as fallback? Or track artist?
       cover: track.cover || "assets/anhmau.png",
     }));

     GlobalAudioManager.setPlaylist(songs, 0, null, nextContainer, () => playNextPlaylist(nextContainer));
     GlobalAudioManager.playSongAt(0);
};

// --- REFACTORED handlePlayTrack ---
/**
 * Handles playing a specific track within a given playlist.
 * @param trackToPlay The specific track object that was clicked.
 * @param currentPlaylist The full playlist object the track belongs to.
 * @param playlistContainerElement The DOM element for the playlist container (optional, for context).
 */
const handlePlayTrack = (
  trackToPlay: TrackItem,
  currentPlaylist: PlaylistData,
  playlistContainerElement?: HTMLDivElement | null
) => {
  console.log("==> handlePlayTrack START <==", { trackToPlay, currentPlaylist }); // Log khi bắt đầu

  if (!trackToPlay || !trackToPlay.src || !currentPlaylist || !currentPlaylist.tracks) {
      console.error("handlePlayTrack: Invalid track or playlist data provided.");
      return;
  }

  const currentTrackIndex = currentPlaylist.tracks.findIndex(
      (track) => track.id === trackToPlay.id || track.src === trackToPlay.src
  );
  console.log("Found track index:", currentTrackIndex); // Log index tìm được

  if (currentTrackIndex === -1) {
      console.error("handlePlayTrack: Clicked track not found in the provided playlist data.");
      return;
  }

  const songs: Song[] = currentPlaylist.tracks.map((track) => ({
      id: track.id,
      src: track.src,
      title: track.title,
      artist: track.artist,
      cover: track.cover || "/assets/default_track_cover.png",
  }));
  console.log("Mapped songs for GlobalAudioManager:", songs); // Log mảng songs

  const currentGlobalSong = GlobalAudioManager.getCurrentSong();
  const currentAudio = GlobalAudioManager.getCurrentAudio();

  if (currentGlobalSong?.src === trackToPlay.src) {
       console.log("Clicked on the currently playing song. Toggling play/pause."); // Log khi toggle
      if (currentAudio) {
          currentAudio.paused ? currentAudio.play() : currentAudio.pause();
          console.log(currentAudio.paused ? "Paused" : "Playing", trackToPlay.title);
      }
      return;
  }

  console.log(`Calling GlobalAudioManager.setPlaylist with index: ${currentTrackIndex}`); // Log trước khi set playlist
  GlobalAudioManager.setPlaylist(
      songs,
      currentTrackIndex,
      null,
      playlistContainerElement,
      () => { console.warn("onEnd callback triggered"); /* ... */ }
  );

  console.log(`Calling GlobalAudioManager.playSongAt index: ${currentTrackIndex}`); // Log trước khi play
  GlobalAudioManager.playSongAt(currentTrackIndex);
  console.log("==> handlePlayTrack END <=="); // Log khi kết thúc (nếu không return sớm)
};

export default handlePlayTrack; // Export the refactored function

// --- initFirstWaveforms ---
// This function STILL relies on data-playlist and needs refactoring.
// It should likely be called differently from the component, perhaps passing
// the first track's src and the specific waveform container element.
export const initFirstWaveforms = () => {
    console.warn("initFirstWaveforms needs refactoring - currently relies on data-playlist and might not work correctly.");
    const containers = document.querySelectorAll(".player-container");

    containers.forEach((container) => {
        // This part will fail as data-playlist is removed
        const playlistDataAttr = container.getAttribute("data-playlist");
        if (!playlistDataAttr) {
            console.log("initFirstWaveforms: Skipping container, no data-playlist attribute found.", container);
            return;
        };

        try {
            const playlistData = JSON.parse(playlistDataAttr);
            const firstTrack = playlistData?.tracks?.[0];
            if (!firstTrack || !firstTrack.src) {
                 console.log("initFirstWaveforms: Skipping playlist, no first track or src found.", playlistData);
                 return;
            }

            const waveformContainer = container.querySelector(".waveform .audio-playlist") as HTMLDivElement | null;
            if (!waveformContainer) {
                 console.log("initFirstWaveforms: Skipping playlist, no waveform container found.", container);
                 return;
            }

            console.log("initFirstWaveforms: Initializing for", firstTrack.src);
            // Avoid creating WaveSurfer instance if one already exists for this container
            if (waveformMap.has(waveformContainer)) {
                 console.log("initFirstWaveforms: Waveform already exists for this container, skipping.");
                 return;
            }

            // Use a temporary audio element just to load metadata for the waveform
            const tempAudio = new Audio(firstTrack.src);
            tempAudio.crossOrigin = "anonymous"; // Important for loading from different origins

            tempAudio.addEventListener("loadedmetadata", () => {
                console.log("initFirstWaveforms: Metadata loaded for", firstTrack.src);
                renderWaveform(tempAudio, waveformContainer); // Render waveform using the temp audio
            }, { once: true }); // Use once to avoid multiple renders

             tempAudio.addEventListener("error", (e) => {
                 console.error("initFirstWaveforms: Error loading audio metadata for", firstTrack.src, e);
             });

        } catch (e) {
            console.error("initFirstWaveforms: Error parsing data-playlist", e, playlistDataAttr);
        }
    });
};

// handleSongChanged function (keep as is for now, but ensure it gets the correct container)
const handleSongChanged = () => {
    console.log("🎧 songchanged event fired!");
    // ... (keep existing logic, but verify GlobalAudioManager.getPlaylistContainer() works) ...

     const container = GlobalAudioManager.getPlaylistContainer();
     if (!container) return console.log("⛔ No playlist container found (handleSongChanged)");

     const waveformContainer = container.querySelector(".waveform .audio-playlist") as HTMLDivElement | null;
     const audio = GlobalAudioManager.getCurrentAudio();
     const song = GlobalAudioManager.getCurrentSong();

     if (!waveformContainer || !audio || !song) return console.log("⛔ Missing waveform container, audio or song (handleSongChanged)");

     const existing = waveformMap.get(waveformContainer);
     // Only re-render if the source is different OR if the existing wavesurfer is destroyed/invalid
     if (existing && existing.src === song.src && existing.waveSurfer) {
          console.log("handleSongChanged: Waveform already exists for this src, skipping re-render.");
          // Optional: Ensure the existing wavesurfer is synced if needed
          // existing.waveSurfer.seekTo(audio.currentTime / audio.duration);
          return;
     }


     // Ensure audio metadata is loaded before rendering
     if (audio.readyState >= 1) { // HAVE_METADATA or higher
       console.log("🔄 Rendering new waveform for:", song.title || song.src);
       renderWaveform(audio, waveformContainer);
     } else {
       console.log("Audio metadata not ready, adding event listener for:", song.title || song.src);
       audio.addEventListener(
         "loadedmetadata",
         () => {
           console.log("🔄 Rendering new waveform after metadata load:", song.title || song.src);
           renderWaveform(audio, waveformContainer);
         },
         { once: true } // Important to avoid multiple event listeners
       );
         audio.addEventListener("error", (e) => {
             console.error("Error loading audio metadata in handleSongChanged for", song.src, e);
         });
     }
};

// Ensure the event listener is added only once
// It might be better to manage this listener setup/cleanup within a React component/hook
// instead of globally like this, but we'll keep it for now.
window.removeEventListener("songchanged", handleSongChanged); // Remove previous listener if any
window.addEventListener("songchanged", handleSongChanged);
