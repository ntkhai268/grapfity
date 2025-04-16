import WaveSurfer from 'wavesurfer.js';
import GlobalAudioManager, { Song } from './GlobalAudioManager';

let currentPlaying: HTMLAudioElement | null = null;
let currentButton: HTMLImageElement | null = null;
const waveTracks: { [key: string]: WaveSurfer } = {}; // Lưu tất cả các waveTrack theo src để reset

function initWaveSurfer(): void {
  const songElements = Array.from(document.querySelectorAll(".content.active .song"));

  const playlist: Song[] = songElements.map((songElement) => ({
    title: songElement.getAttribute("data-title") || "Không rõ tiêu đề",
    artist: songElement.getAttribute("data-artist") || "Không rõ ca sĩ",
    cover: songElement.getAttribute("data-cover") || "assets/anhmau.png",
    src: songElement.getAttribute("data-src")!,
  })) as Song[];

  songElements.forEach((songElement, index) => {
    const audioContainer = songElement.querySelector<HTMLElement>(".audio");
    const playButton = songElement.querySelector<HTMLImageElement>(".play_button img");
    const songSrc = songElement.getAttribute("data-src");

    if (!audioContainer || !playButton || !songSrc) return;
    if (audioContainer.dataset.waveInitialized) return;

    const audio = new Audio(songSrc);
    audio.crossOrigin = "anonymous";

    audio.addEventListener("loadedmetadata", () => {
      console.log("🧠 Duration:", audio.duration);
    });

    const waveTrack = WaveSurfer.create({
      container: audioContainer,
      waveColor: '#808080',
      progressColor: '#fff',
      barWidth: 2,
      height: 50,
      mediaControls: false,
      backend: "MediaElement",
      media: audio,
    });

    waveTrack.load(songSrc);
    waveTracks[songSrc] = waveTrack;
    audioContainer.dataset.waveInitialized = "true";

    const song = playlist[index];

    songElement.querySelector(".play_button")!.addEventListener("click", () => {
      const isThisTabActive = songElement.closest(".content")?.classList.contains("active");
      if (!isThisTabActive) return;

      if (GlobalAudioManager.getCurrentAudio() === audio && !audio.paused) {
        audio.pause();
        playButton.src = "assets/play.png";
        GlobalAudioManager.setIsPlaying(false);
      } else {
        Object.entries(waveTracks).forEach(([src, track]) => {
          if (src !== songSrc) track.seekTo(0);
        });

        if (currentPlaying && currentPlaying !== audio) {
          currentPlaying.pause();
          if (currentButton) currentButton.src = "assets/play.png";
        }

        if (!GlobalAudioManager.isSamePlaylist(playlist)) {
          GlobalAudioManager.setPlaylist(playlist, index, (i) => {
            const nextSongSrc = playlist[i].src;
            const nextSongElement = document.querySelector(`.content.active .song[data-src="${nextSongSrc}"]`);
            nextSongElement?.querySelector(".play_button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          });
        } else {
          GlobalAudioManager.setCurrentIndex(index);
          const playCallback = GlobalAudioManager.getPlaylist()?.[index];
          if (playCallback) {
            audio.src = playCallback.src;
            audio.load();
          }
        }

        GlobalAudioManager.setActive(
          "waveform",
          () => {
            audio.pause();
            playButton.src = "assets/play.png";
          },
          audio,
          song
        );

        audio.play();
        playButton.src = "assets/stop.png";
        currentPlaying = audio;
        currentButton = playButton;

        GlobalAudioManager.subscribe(() => {
          const currentAudio = GlobalAudioManager.getCurrentAudio();
          if (currentAudio === audio) {
            playButton.src = GlobalAudioManager.getIsPlaying() ? "assets/stop.png" : "assets/play.png";
          }
        });
      }
    });

    audio.addEventListener("ended", () => {
      playButton.src = "assets/play.png";
      const nextIndex = GlobalAudioManager.getCurrentIndex() + 1;
      const newPlaylist = GlobalAudioManager.getPlaylist();
      if (nextIndex < newPlaylist.length) {
        const nextSongSrc = newPlaylist[nextIndex].src;
        const nextSongElement = document.querySelector(`.content.active .song[data-src="${nextSongSrc}"]`);
        const nextPlayBtn = nextSongElement?.querySelector(".play_button") as HTMLElement;
        nextPlayBtn?.click();
      }
    });

    console.log(`WaveSurfer đã khởi tạo cho bài hát: ${songSrc}`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initWaveSurfer, 500);
});

export { initWaveSurfer };