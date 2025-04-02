import WaveSurfer from "wavesurfer.js";

export function initializeWaveSurfer() {
    console.log("WaveSurfer initialized!");

    const playlists = document.querySelectorAll(".player-container");
    const waveSurfers = new Map();
    let currentPlaying = null;
    let currentTrackElement = null;
    let isTrackFinished = false;

    playlists.forEach((playlist, index) => {
        const waveContainer = playlist.querySelector(".audio-playlist");
        if (!waveContainer) {
            console.error(`Lỗi: Không tìm thấy .audio-playlist trong playlist ${index + 1}`);
            return;
        }

        // 🔥 Kiểm tra nếu WaveSurfer đã tồn tại
        if (waveContainer.dataset.wavesurferInit === "true") {
            console.warn(`WaveSurfer đã tồn tại trong playlist ${index + 1}, bỏ qua.`);
            return;
        }
        waveContainer.dataset.wavesurferInit = "true";

        const wavesurfer = WaveSurfer.create({
            container: waveContainer,
            waveColor: "#fff",
            progressColor: "#ff5500",
            barWidth: 2,
            height: 50,
            responsive: true,
        });

        waveSurfers.set(playlist, wavesurfer);

        function loadTrack(trackElement, autoPlay = true) {
            const trackUrl = trackElement.getAttribute("data-src");
            if (!trackUrl) return;

            const parentPlaylist = trackElement.closest(".player-container");
            const ws = waveSurfers.get(parentPlaylist);

            if (!ws) return;

            // Dừng track cũ nếu đổi playlist
            if (currentPlaying && currentPlaying !== parentPlaylist) {
                const oldWs = waveSurfers.get(currentPlaying);
                if (oldWs) {
                    oldWs.stop();
                    currentPlaying.querySelectorAll(".track-item").forEach((item) =>
                        item.classList.remove("active")
                    );
                }
            }

            currentPlaying = parentPlaylist;

            // Nếu bấm lại track đang phát, toggle play/pause
            if (currentTrackElement === trackElement) {
                ws.isPlaying() ? ws.pause() : ws.play();
            } else {
                ws.stop();
                ws.load(trackUrl);

                ws.on("ready", () => {
                    if (autoPlay) ws.play();
                });

                parentPlaylist.querySelectorAll(".track-item").forEach((item) =>
                    item.classList.remove("active")
                );
                trackElement.classList.add("active");
                currentTrackElement = trackElement;
            }

            // Đăng ký sự kiện hoàn thành track
            ws.un("finish"); // Xóa sự kiện cũ
            ws.on("finish", () => {
                if (!isTrackFinished) {
                    isTrackFinished = true;
                    playNextTrackOrPlaylist();
                    setTimeout(() => (isTrackFinished = false), 500);
                }
            });
        }

        function playNextTrackOrPlaylist() {
            if (!currentTrackElement) return;
            const nextTrack = currentTrackElement.nextElementSibling;

            if (nextTrack && nextTrack.classList.contains("track-item")) {
                loadTrack(nextTrack, true);
            } else {
                playNextPlaylist();
            }
        }

        function playNextPlaylist() {
            if (!currentPlaying) return;
            let nextPlaylist = currentPlaying.nextElementSibling;
            while (nextPlaylist && !nextPlaylist.classList.contains("player-container")) {
                nextPlaylist = nextPlaylist.nextElementSibling;
            }

            if (nextPlaylist) {
                const firstTrack = nextPlaylist.querySelector(".track-item[data-src]");
                if (firstTrack) {
                    setTimeout(() => loadTrack(firstTrack, true), 300);
                }
            }
        }

        // Gán sự kiện click cho từng track
        playlist.querySelectorAll(".track-item[data-src]").forEach((track) => {
            track.addEventListener("click", function () {
                loadTrack(this);
            });
        });

        // Tự động load bài đầu tiên nhưng không phát
        const firstTrack = playlist.querySelector(".track-item[data-src]");
        if (firstTrack) {
            loadTrack(firstTrack, false);
            firstTrack.classList.remove("active"); 
        }
    });
}
