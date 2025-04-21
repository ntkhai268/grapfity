import WaveSurfer from 'wavesurfer.js';
import GlobalAudioManager, { Song } from './GlobalAudioManager';

let currentPlaying: HTMLAudioElement | null = null;
let currentButton: HTMLImageElement | null = null;
const waveTracks: { [key: string]: WaveSurfer } = {}; // Lưu các waveform theo src

function initWaveSurfer(): void {
  const songElements = Array.from(document.querySelectorAll(".content.active .song"));

  const playlist: Song[] = songElements.map((el) => ({
    title: el.getAttribute("data-title") || "Không rõ tiêu đề",
    artist: el.getAttribute("data-artist") || "Không rõ ca sĩ",
    cover: el.getAttribute("data-cover") || "assets/anhmau.png",
    src: el.getAttribute("data-src")!,
  }));

  const srcList: string[] = playlist.map(song => song.src);

  songElements.forEach((songElement, index) => {
    const audioContainer = songElement.querySelector<HTMLElement>(".audio");
    const playButton = songElement.querySelector<HTMLImageElement>(".play_button img");
    const songSrc = songElement.getAttribute("data-src");

    if (!audioContainer || !playButton || !songSrc) return;
    if (audioContainer.dataset.waveInitialized) return;

    const audio = new Audio(songSrc);
    audio.crossOrigin = "anonymous";

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

      const currentAudio = GlobalAudioManager.getCurrentAudio();

      if (currentAudio === audio && !audio.paused) {
        audio.pause();
        playButton.src = "assets/play.png";
        GlobalAudioManager.setIsPlaying(false);
        return;
      }

      Object.entries(waveTracks).forEach(([src, track]) => {
        if (src !== songSrc) track.seekTo(0);
      });

      if (currentPlaying && currentPlaying !== audio) {
        currentPlaying.pause();
        if (currentButton) currentButton.src = "assets/play.png";
      }

      // Nếu playlist khác hoặc chưa set
      if (!GlobalAudioManager.isSamePlaylist(playlist)) {
        GlobalAudioManager.setPlaylist(playlist, index, (nextIndex) => {
          const nextSrc = srcList[nextIndex];
          const nextSongElement = document.querySelector(`.content.active .song[data-src="${nextSrc}"]`);
          nextSongElement?.querySelector(".play_button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
      } else {
        GlobalAudioManager.setCurrentIndex(index);
        const current = GlobalAudioManager.getPlaylist()?.[index];
        if (current) {
          audio.src = current.src;
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
        const isThisAudio = GlobalAudioManager.getCurrentAudio() === audio;
        if (isThisAudio) {
          playButton.src = GlobalAudioManager.getIsPlaying() ? "assets/stop.png" : "assets/play.png";
        }
      });
    });

    audio.addEventListener("ended", () => {
      playButton.src = "assets/play.png";
      // Không cần xử lý auto-next ở đây nữa vì đã truyền callback vào setPlaylist
    });

    console.log(`✅ WaveSurfer đã khởi tạo cho: ${song.title}`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initWaveSurfer, 500);
});

export { initWaveSurfer };
