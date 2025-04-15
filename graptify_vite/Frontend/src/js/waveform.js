import WaveSurfer from 'wavesurfer.js';
import GlobalAudioManager from './GlobalAudioManager';

let currentPlaying = null;
let currentButton = null;

function initWaveSurfer() {
  const songElements = Array.from(document.querySelectorAll(".song"));

  const playlist = songElements.map((songElement) => ({
    title: songElement.getAttribute("data-title") || "Không rõ tiêu đề",
    artist: songElement.getAttribute("data-artist") || "Không rõ ca sĩ",
    cover: songElement.getAttribute("data-cover") || "assets/anhmau.png",
    src: songElement.getAttribute("data-src"),
  }));

  songElements.forEach((songElement, index) => {
    const audioContainer = songElement.querySelector(".audio");
    const playButton = songElement.querySelector(".play_button img");
    const songSrc = songElement.getAttribute("data-src");

    if (!audioContainer || !playButton || !songSrc) return;

    if (audioContainer.dataset.waveInitialized) return;

    const waveTrack = WaveSurfer.create({
      container: audioContainer,
      waveColor: '#fff',
      progressColor: '#383351',
      barWidth: 2,
      height: 50,
    });

    waveTrack.load(songSrc);
    audioContainer.dataset.waveInitialized = true;

    const song = playlist[index];

    songElement.querySelector(".play_button").addEventListener("click", () => {
      if (waveTrack.isPlaying()) {
        waveTrack.pause();
        playButton.src = "assets/play.png";
        GlobalAudioManager.setIsPlaying(false);
      } else {
        // Nếu đang chơi bài khác, dừng lại
        if (currentPlaying && currentPlaying !== waveTrack) {
          currentPlaying.stop();
          if (currentButton) currentButton.src = "assets/play.png";
        }

        // Gán playlist hiện tại
        GlobalAudioManager.setPlaylist(playlist, index);

        // Gán bài active
        GlobalAudioManager.setActive(
          "waveform",
          () => {
            waveTrack.stop();
            playButton.src = "assets/play.png";
          },
          waveTrack,
          song,
        );

        waveTrack.play();
        playButton.src = "assets/stop.png";
        currentPlaying = waveTrack;
        currentButton = playButton;

        GlobalAudioManager.subscribe(() => {
          const currentAudio = GlobalAudioManager.getCurrentAudio();
          if (currentAudio === waveTrack && !GlobalAudioManager.getIsPlaying()) {
            playButton.src = "assets/play.png";
          } else if (currentAudio === waveTrack && GlobalAudioManager.getIsPlaying()) {
            playButton.src = "assets/stop.png";
          }
        });
      }
    });

    waveTrack.on("finish", () => {
      playButton.src = "assets/play.png";
      GlobalAudioManager.playNext(); // gọi từ GlobalAudioManager thay vì click DOM
    });

    console.log(`WaveSurfer đã khởi tạo cho bài hát: ${songSrc}`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initWaveSurfer, 500);
});

export { initWaveSurfer };
