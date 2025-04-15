import WaveSurfer from "wavesurfer.js";
import GlobalAudioManager from "./GlobalAudioManager";

export function initializeWaveSurfer() {
    console.log("WaveSurfer initialized!");

    const playlists = document.querySelectorAll(".player-container");
    const waveSurfers = new Map();
    let currentPlaying = null;
    let currentTrackElement = null;
    let isTrackFinished = false;

    function setPlaylist(tracks, startIndex = 0) {
        GlobalAudioManager.setPlaylist({
            list: tracks,
            startIndex,
            play: (index) => playSongAt(index),
        });
    }

    function playSongAt(index) {
        const playlist = GlobalAudioManager.getPlaylistContainer();
        if (!playlist) return;
        const tracks = Array.from(playlist.querySelectorAll(".track-item[data-src]"));
        const track = tracks[index];
        if (track) track.click();
    }

    playlists.forEach((playlist, index) => {
        const waveContainer = playlist.querySelector(".audio-playlist");
        if (!waveContainer) {
            console.error(`Lỗi: Không tìm thấy .audio-playlist trong playlist ${index + 1}`);
            return;
        }

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

            const song = {
                title: trackElement.getAttribute("data-title") || "Không rõ",
                artist: trackElement.getAttribute("data-artist") || "Không rõ",
                cover: trackElement.getAttribute("data-cover") || "assets/anhmau.png",
                src: trackUrl,
            };

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

            if (currentTrackElement === trackElement) {
                if (ws.isPlaying()) {
                    ws.pause();
                    GlobalAudioManager.setIsPlaying(false);
                } else {
                    GlobalAudioManager.setActive(
                        "playlist",
                        () => ws.stop(),
                        { play: () => ws.play(), pause: () => ws.pause(), stop: () => ws.stop() },
                        song
                    );
                    ws.play();
                }
            } else {
                ws.stop();
                ws.load(trackUrl);

                ws.un("ready");
                ws.on("ready", () => {
                    if (autoPlay) {
                        GlobalAudioManager.setActive(
                            "playlist",
                            () => ws.stop(),
                            { play: () => ws.play(), pause: () => ws.pause(), stop: () => ws.stop() },
                            song
                        );
                        setTimeout(() => ws.play(), 0);
                    }
                });

                parentPlaylist.querySelectorAll(".track-item").forEach((item) =>
                    item.classList.remove("active")
                );
                trackElement.classList.add("active");
                currentTrackElement = trackElement;

                // Cập nhật index hiện tại cho GlobalAudioManager
                const tracks = Array.from(parentPlaylist.querySelectorAll(".track-item[data-src]"));
                const currentIndex = tracks.indexOf(trackElement);
                setPlaylist(tracks, currentIndex);
            }

            ws.un("finish");
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

        // Click từng bài
        playlist.querySelectorAll(".track-item[data-src]").forEach((track) => {
            track.addEventListener("click", function () {
                loadTrack(this);
            });
        });

        // Click nút “Play Playlist”
        const playBtn = playlist.querySelector(".play-playlist");
        if (playBtn) {
            playBtn.addEventListener("click", () => {
                const tracks = Array.from(playlist.querySelectorAll(".track-item[data-src]"));
                if (tracks.length) {
                    setPlaylist(tracks, 0);
                    playSongAt(0);
                }
            });
        }

        // Load track đầu tiên không tự play
        const firstTrack = playlist.querySelector(".track-item[data-src]");
        if (firstTrack) {
            loadTrack(firstTrack, false);
            firstTrack.classList.remove("active");
        }
    });
}
