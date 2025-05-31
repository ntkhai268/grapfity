import WaveSurfer from "wavesurfer.js";
// Import GlobalAudioManager và các kiểu cần thiết
// Đảm bảo đường dẫn đúng
import GlobalAudioManager, { Song, PlaylistContext } from "../hooks/GlobalAudioManager"; 

// --- Định nghĩa kiểu dữ liệu (Đảm bảo khớp với dữ liệu thực tế) ---
interface TrackItem {
    id: number | string;
    title: string;
    src: string;
    artist: string;
    cover: string;
}
interface PlaylistData {
    id: number | string; // ID của playlist
    title: string;       // Tên playlist
    artist: string;      // Tên người tạo playlist (hoặc nghệ sĩ chính nếu là album)
    timeAgo: string;     // Thông tin thời gian (có thể không cần thiết)
    cover: string | null;// Ảnh bìa playlist
    tracks: TrackItem[]; // Danh sách các bài hát trong playlist
}

// Map để lưu WaveSurfer instances (quản lý các waveform hiển thị trong danh sách)
const waveformMap = new Map<HTMLDivElement, { waveSurfer: WaveSurfer; src: string }>();

/**
 * Render hoặc cập nhật WaveSurfer cho một audio element trong container được chỉ định.
 * Sử dụng audio element hiện tại từ GlobalAudioManager.
 */
const renderWaveform = (audio: HTMLAudioElement, container: HTMLDivElement) => {
    console.log(`[Manager_Playlist] Rendering waveform for: ${audio.src} in container:`, container);
    const existing = waveformMap.get(container);
    
    // Chỉ destroy và tạo lại nếu src khác hoặc chưa có instance hợp lệ
    if (existing) {
        if (existing.src === audio.src && existing.waveSurfer) { 
             console.log(`[Manager_Playlist] Waveform already exists for ${audio.src}, syncing seek.`);
             // Đồng bộ vị trí hiện tại của waveform với audio element
             const currentProgress = audio.currentTime / audio.duration;
             if (!isNaN(currentProgress) && isFinite(currentProgress)) {
                 existing.waveSurfer.seekTo(currentProgress); // Seek theo tỉ lệ (0-1)
             }
             return; 
        }
        console.log(`[Manager_Playlist] Destroying existing waveform for different src: ${existing.src}`);
        try {
            existing.waveSurfer.destroy();
        } catch (e) { console.error("Error destroying old waveform in renderWaveform:", e); }
        waveformMap.delete(container); 
    }

    // Tạo instance WaveSurfer mới
    try {
        const waveSurfer = WaveSurfer.create({
            container,
            waveColor: "#a9a9a9", 
            progressColor: "#fff", 
            cursorColor: "transparent", 
            barWidth: 2,
            height: 50, 
            media: audio, // QUAN TRỌNG: Gắn audio element từ GlobalAudioManager
            backend: "MediaElement",
             hideScrollbar: true,
             interact: true, // Cho phép click/kéo để seek
        });

        waveformMap.set(container, { waveSurfer, src: audio.src });
        console.log(`[Manager_Playlist] New waveform created and mapped for ${audio.src}`);

        // Lắng nghe sự kiện 'seeking' từ WaveSurfer (khi người dùng tương tác)
    //    waveSurfer.on("seeking", (progress: number) => {
    //         if (!isNaN(progress) && progress >= 0 && progress <= 1) {
    //             const percent = progress * 100;
    //             console.log(`[Waveform] Seek event by user: progress = ${progress}, percent = ${percent}`);
    //             GlobalAudioManager.seekTo(percent);
    //         }
    //     });
        
        // Lắng nghe lỗi từ WaveSurfer
        waveSurfer.on('error', (err) => {
            console.error(`[Waveform] WaveSurfer error for ${audio.src}:`, err);
        });

    } catch (error) {
        console.error("[Manager_Playlist] Error creating WaveSurfer in renderWaveform:", error);
    }
};

/**
 * Hàm chính xử lý khi người dùng click vào một bài hát trong danh sách playlist UI.
 * Cập nhật GlobalAudioManager và yêu cầu phát nhạc.
 */

const handlePlayTrack = (
  trackToPlay: TrackItem,
  currentPlaylistData: PlaylistData,
  playlistContainerElement?: HTMLDivElement | null,
  contextOverride?: PlaylistContext
) => {
  // Đưa khai báo newPlaylistContext lên đầu hàm để dùng ở log
  const newPlaylistContext: PlaylistContext = contextOverride || {
    id: currentPlaylistData.id,
    type: "playlist"
  };

  console.log("⛔⛔⛔⛔⛔[handlePlayTrack] START", {
    trackToPlayId: trackToPlay.id,
    playlistId: currentPlaylistData.id,
    playlistLength: currentPlaylistData.tracks.length,
    newPlaylistContext,
    currentGlobalSong: GlobalAudioManager.getCurrentSong(),
    currentGlobalContext: GlobalAudioManager.getCurrentContext?.(),
  });

  // Dọn các waveform ở container khác
  if (playlistContainerElement) {
    const allContainers = document.querySelectorAll(".player-container");
    allContainers.forEach(container => {
      if (container !== playlistContainerElement) {
        const waveformDiv = container.querySelector(".waveform .audio-playlist") as HTMLDivElement | null;
        if (waveformDiv && waveformMap.has(waveformDiv)) {
          try { waveformMap.get(waveformDiv)?.waveSurfer.destroy(); } catch (e) {}
          waveformMap.delete(waveformDiv);
        }
      }
    });
  }

  // Kiểm tra đầu vào
  if (!trackToPlay || !trackToPlay.src || !currentPlaylistData || !currentPlaylistData.tracks || currentPlaylistData.tracks.length === 0) {
    console.error("handlePlayTrack: Invalid track or playlist data provided.");
    return;
  }

  // Tìm index track
  const currentTrackIndex = currentPlaylistData.tracks.findIndex(track => track.id === trackToPlay.id);
  console.log("[handlePlayTrack] Found track index:", currentTrackIndex);

  if (currentTrackIndex === -1) {
    console.error("handlePlayTrack: Clicked track not found in the provided playlist data.");
    return;
  }

  // Map TrackItem[] sang Song[]
  const songs: Song[] = currentPlaylistData.tracks.map((track: TrackItem): Song => ({
    id: track.id,
    src: track.src || '',
    title: track.title === null ? undefined : track.title,
    artist: track.artist === null ? undefined : track.artist,
    cover: track.cover === null ? undefined : track.cover,
  }));
  console.log("[handlePlayTrack] Mapped songs for GlobalAudioManager:", songs.length);

  const currentGlobalSong = GlobalAudioManager.getCurrentSong();
  const currentGlobalIsPlaying = GlobalAudioManager.getIsPlaying();
  const currentGlobalContext = GlobalAudioManager.getCurrentContext?.();

  // So sánh context playlist hiện tại
  const isSamePlaylist =
    currentGlobalContext?.id === newPlaylistContext.id &&
    currentGlobalContext?.type === newPlaylistContext.type;

  if (isSamePlaylist) {
    // Đang ở cùng playlist, xử lý play/pause như cũ
    if (currentGlobalSong?.id === trackToPlay.id && currentGlobalIsPlaying) {
      console.log("[handlePlayTrack] Requesting pausePlayback.");
      GlobalAudioManager.pausePlayback();
    } else if (currentGlobalSong?.id === trackToPlay.id && !currentGlobalIsPlaying) {
      console.log("[handlePlayTrack] Requesting resume via playSongAt.");
      GlobalAudioManager.playSongAt(currentTrackIndex);
    } else {
      console.log("[handlePlayTrack] Play khác track trong cùng playlist.");
      GlobalAudioManager.playSongAt(currentTrackIndex);
    }
  } else {
    // Khác playlist, phải setPlaylist mới!
    console.log(`[handlePlayTrack] Setting NEW playlist and playing track at index: ${currentTrackIndex}`);
    GlobalAudioManager.setPlaylist(
      [...songs],                           // ép tạo mảng mới
      currentTrackIndex,
      { ...newPlaylistContext },            // ép tạo object mới
      undefined,
      playlistContainerElement,
      undefined
    );
    GlobalAudioManager.playSongAt(currentTrackIndex);
  }

  console.log("==> handlePlayTrack END <==");
};



// Export hàm chính để component React sử dụng
export default handlePlayTrack; 

// --- Hàm xử lý sự kiện khi bài hát thay đổi trong GlobalAudioManager ---
// Hàm này cập nhật waveform tương ứng với bài hát đang phát
let prevPlaylistContextId: any = null;

// Utility: Xóa toàn bộ waveform trong Map (an toàn khi chuyển playlist)
function clearAllWaveforms() {
    waveformMap.forEach(({ waveSurfer }) => {
        try { waveSurfer.destroy(); } catch (e) {}
    });
    waveformMap.clear();
}

function waitForElement(selector: string, container: HTMLElement, timeout = 500): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
        let elapsed = 0;
        function check() {
            const el = container.querySelector(selector);
            if (el) return resolve(el as HTMLElement);
            elapsed += 20;
            if (elapsed > timeout) return reject(`Timeout: Not found ${selector}`);
            setTimeout(check, 20);
        }
        check();
    });
}

const handleSongChanged = async () => {
    console.log("🎧 [Manager_Playlist] songchanged event fired!");

    // Lấy context id hiện tại (playlist hoặc tab)
    const playlistContext = GlobalAudioManager.getCurrentContext();
    const currentContextId = playlistContext?.id;

    // Nếu contextId đổi (playlist khác), clear tất cả waveformMap (fix waveform cũ đứng hình)
    if (prevPlaylistContextId !== null && prevPlaylistContextId !== currentContextId) {
        console.log("[Manager_Playlist] Playlist context changed, clearing all waveforms.");
        clearAllWaveforms();
    }
    prevPlaylistContextId = currentContextId;

    // Lấy container của playlist hiện tại
    const container = GlobalAudioManager.getPlaylistContainer?.();
    if (!container) {
        console.log("⛔ [Manager_Playlist] No playlist container found. Cannot update waveform.");
        return;
    }

    // Chờ DOM có waveformContainer (audio-playlist)
    let waveformContainer: HTMLDivElement | null = null;
    try {
        waveformContainer = (await waitForElement(".waveform .audio-playlist", container)) as HTMLDivElement;
    } catch (e) {
        console.log("[Manager_Playlist] waveform container not found:", e);
        return;
    }

    const audio = GlobalAudioManager.getCurrentAudio?.();
    const song = GlobalAudioManager.getCurrentSong?.();

    // Không có audio hoặc bài hát => clear sóng nếu có
    if (!audio || !song) {
        console.log("⛔ [Manager_Playlist] No current audio or song. Clearing waveform if exists.");
        const existing = waveformMap.get(waveformContainer);
        if (existing) {
            try { existing.waveSurfer.destroy(); } catch(e) {}
            waveformMap.delete(waveformContainer);
        }
        return;
    }

    console.log(`[Manager_Playlist] handleSongChanged - Preparing to render/update waveform for: ${song.title || song.src}`);

    // Render/cập nhật waveform
    if (audio.readyState >= 1) {
        // Nếu metadata sẵn sàng, render ngay
        setTimeout(() => {
            renderWaveform(audio, waveformContainer);
        }, 0);
    } else {
        // Nếu chưa, chờ metadata load xong rồi render
        const handleAudioErrorLocal = (event: Event) => {
            console.error("[Manager_Playlist] Error loading audio metadata in handleSongChanged for", song.src, event);
            audio.removeEventListener("loadedmetadata", handleMetadataOnce);
        };
        const handleMetadataOnce = () => {
            console.log("[Manager_Playlist] Metadata loaded via listener, rendering waveform for:", song.title || song.src);
            setTimeout(() => {
                renderWaveform(audio, waveformContainer);
            }, 0);
            audio.removeEventListener("error", handleAudioErrorLocal);
        };
        audio.removeEventListener("loadedmetadata", handleMetadataOnce);
        audio.removeEventListener("error", handleAudioErrorLocal);
        audio.addEventListener("loadedmetadata", handleMetadataOnce, { once: true });
        audio.addEventListener("error", handleAudioErrorLocal, { once: true });
    }
};

// Gắn listener cho sự kiện 'songchanged' của GlobalAudioManager
// Đảm bảo chỉ gắn một lần
window.removeEventListener("songchanged", handleSongChanged); 
window.addEventListener("songchanged", handleSongChanged);
console.log("[Manager_Playlist] Event listener for 'songchanged' attached.");

// --- Hàm initFirstWaveforms (CẢNH BÁO: Vẫn dựa vào data-playlist và logic cũ) ---
// Hàm này có thể không còn cần thiết hoặc cần được viết lại hoàn toàn
// để phù hợp với luồng dữ liệu React và GlobalAudioManager mới.
// Tạm thời giữ lại và export nếu bạn vẫn đang gọi nó từ đâu đó.
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

// Export các hàm cần thiết
// export { handlePlayTrack, initFirstWaveforms }; // Nếu bạn cần cả hai
