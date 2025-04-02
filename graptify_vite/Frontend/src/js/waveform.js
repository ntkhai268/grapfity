console.log("waveform.js đã chạy!");
import WaveSurfer from 'wavesurfer.js'; // Kiểm tra WaveSurfer có được import không

let currentPlaying = null; // Lưu bài hát đang phát
let currentButton = null;  // Lưu nút play của bài đang phát

function initWaveSurfer() {
    document.querySelectorAll(".song").forEach((songElement) => {
        const audioContainer = songElement.querySelector(".audio");
        if (!audioContainer) {
            console.warn("Không tìm thấy .audio trong", songElement);
            return;
        }
        const playButton = songElement.querySelector(".play_button img");
        if (!playButton) {
            console.warn("Không tìm thấy play_button trong", songElement);
            return;
        }

        const songSrc = songElement.getAttribute("data-src");
        if (!songSrc) {
            console.error("Không tìm thấy data-src trong", songElement);
            return;
        }

        // Kiểm tra nếu WaveSurfer đã được khởi tạo
        if (audioContainer.dataset.waveInitialized) return;

        let waveTrack = WaveSurfer.create({
            container: audioContainer,
            waveColor: '#fff',
            progressColor: '#383351',
            barWidth: 2,
            height: 50,
        });

        waveTrack.load(songSrc); // Load file nhạc ngay lập tức
        audioContainer.dataset.waveInitialized = true; // Đánh dấu đã khởi tạo

        // Xử lý sự kiện Play/Pause
        songElement.querySelector(".play_button").addEventListener("click", () => {
            if (waveTrack.isPlaying()) {
                waveTrack.pause();
                playButton.src = "assets/play.png"; // Đổi icon về Play
            } else {
                if (currentPlaying && currentPlaying !== waveTrack) {
                    currentPlaying.stop(); // Dừng bài cũ
                    if (currentButton) currentButton.src = "assets/play.png"; // Reset icon bài cũ
                }

                waveTrack.play();
                playButton.src = "assets/stop.png"; // Đổi icon thành Stop
                
                currentPlaying = waveTrack;
                currentButton = playButton;
            }
        });

        console.log(`WaveSurfer đã khởi tạo cho bài hát: ${songSrc}`);
    });
}

// Gọi hàm khi React render xong
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initWaveSurfer, 500); // Chờ 500ms để đảm bảo DOM có đủ phần tử
});
export { initWaveSurfer };
