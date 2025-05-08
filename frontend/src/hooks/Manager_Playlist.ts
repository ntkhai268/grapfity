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
        waveSurfer.on("seeking", (time: number) => { 
            if (!isNaN(time) && time >= 0) {
                const duration = waveSurfer.getDuration(); 
                if (duration > 0) {
                    const percent = (time / duration) * 100;
                    console.log(`[Waveform] Seeking event triggered by user: time = ${time}, percent = ${percent}`);
                    // Yêu cầu GlobalAudioManager seek đến vị trí %
                    GlobalAudioManager.seekTo(percent); 
                }
            }
        });
        
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
  currentPlaylistData: PlaylistData, // Đổi tên để rõ ràng hơn
  playlistContainerElement?: HTMLDivElement | null // DOM element của container playlist (tùy chọn)
) => {
  console.log("==> handlePlayTrack START <==", { trackId: trackToPlay.id, playlistId: currentPlaylistData.id }); 

  // Kiểm tra dữ liệu đầu vào
  if (!trackToPlay || !trackToPlay.src || !currentPlaylistData || !currentPlaylistData.tracks || currentPlaylistData.tracks.length === 0) {
      console.error("handlePlayTrack: Invalid track or playlist data provided.");
      return;
  }

  // Tìm index của bài hát được click
  const currentTrackIndex = currentPlaylistData.tracks.findIndex( (track) => track.id === trackToPlay.id );
  console.log("[handlePlayTrack] Found track index:", currentTrackIndex); 

  if (currentTrackIndex === -1) {
      console.error("handlePlayTrack: Clicked track not found in the provided playlist data.");
      return; 
  }

  // Map danh sách TrackItem[] sang dạng Song[]
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

  // Xử lý Play/Pause/Play New bằng cách gọi hàm của GlobalAudioManager
  if (currentGlobalSong?.id === trackToPlay.id && currentGlobalIsPlaying) {
      console.log("[handlePlayTrack] Requesting pausePlayback."); 
      GlobalAudioManager.pausePlayback(); 
  } else if (currentGlobalSong?.id === trackToPlay.id && !currentGlobalIsPlaying) {
       console.log("[handlePlayTrack] Requesting resume via playSongAt.");
       GlobalAudioManager.playSongAt(currentTrackIndex); 
  } else {
      // Bài hát mới hoặc playlist mới
      console.log(`[handlePlayTrack] Setting playlist and playing new track at index: ${currentTrackIndex}`); 
      
      // Tạo context cho playlist này
      const newPlaylistContext: PlaylistContext = {
          id: currentPlaylistData.id, 
          type: 'playlist' // Giả sử type là 'playlist', điều chỉnh nếu cần
      };
      
      // Set playlist và context mới cho GlobalAudioManager
      // Truyền undefined cho các callback không dùng đến
      GlobalAudioManager.setPlaylist( 
          songs,
          currentTrackIndex, // Index của bài hát sẽ phát
          newPlaylistContext, 
          undefined, // playFn
          playlistContainerElement, // Lưu container nếu cần cho handleSongChanged
          undefined  // onEnded
      );
      
      // Yêu cầu GlobalAudioManager phát bài hát tại index đã chọn
      GlobalAudioManager.playSongAt(currentTrackIndex);
  }
  console.log("==> handlePlayTrack END <=="); 
};

// Export hàm chính để component React sử dụng
export default handlePlayTrack; 

// --- Hàm xử lý sự kiện khi bài hát thay đổi trong GlobalAudioManager ---
// Hàm này cập nhật waveform tương ứng với bài hát đang phát
const handleSongChanged = () => {
    console.log("🎧 [Manager_Playlist] songchanged event fired!");
    // Lấy container từ GlobalAudioManager (được set bởi handlePlayTrack)
    const container = GlobalAudioManager.getPlaylistContainer(); 
    if (!container) {
        // console.log("⛔ [Manager_Playlist] No playlist container found. Cannot update waveform.");
        return; 
    }

    // Tìm đúng vị trí để render waveform bên trong container đó
    const waveformContainer = container.querySelector(".waveform .audio-playlist") as HTMLDivElement | null; 
    const audio = GlobalAudioManager.getCurrentAudio(); // Lấy audio element hiện tại
    const song = GlobalAudioManager.getCurrentSong();   // Lấy thông tin bài hát hiện tại

    if (!waveformContainer) {
        console.log("⛔ [Manager_Playlist] Waveform container (.waveform .audio-playlist) not found inside playlist container.");
        return;
    }
    if (!audio || !song) {
        console.log("⛔ [Manager_Playlist] No current audio or song. Clearing waveform if exists.");
        // Nếu không có audio/song, xóa waveform cũ nếu có
        const existing = waveformMap.get(waveformContainer);
        if (existing) {
            try { existing.waveSurfer.destroy(); } catch(e) {}
            waveformMap.delete(waveformContainer);
        }
        return;
    }

    console.log(`[Manager_Playlist] handleSongChanged - Preparing to render/update waveform for: ${song.title || song.src}`);

    // Render hoặc cập nhật waveform
    // Đảm bảo audio metadata đã load trước khi render
    if (audio.readyState >= 1) { // HAVE_METADATA or higher
        renderWaveform(audio, waveformContainer);
    } else {
        console.log("[Manager_Playlist] Audio metadata not ready, adding event listener for:", song.title || song.src);
        
        // Hàm xử lý lỗi audio cục bộ
        const handleAudioErrorLocal = (event: Event) => { 
            console.error("[Manager_Playlist] Error loading audio metadata in handleSongChanged for", song.src, event);
            audio.removeEventListener("loadedmetadata", handleMetadataOnce); // Quan trọng: Xóa listener nếu lỗi
        };
        // Hàm xử lý khi metadata load xong
        const handleMetadataOnce = () => {
             console.log("[Manager_Playlist] Metadata loaded via listener, rendering waveform for:", song.title || song.src);
             renderWaveform(audio, waveformContainer);
             // Xóa listener lỗi sau khi thành công (không bắt buộc nhưng tốt)
             audio.removeEventListener("error", handleAudioErrorLocal); 
        };
        
        // Xóa listener cũ phòng trường hợp lỗi trước đó
        audio.removeEventListener("loadedmetadata", handleMetadataOnce); 
        audio.removeEventListener("error", handleAudioErrorLocal); 

        // Gắn listener mới
        audio.addEventListener("loadedmetadata", handleMetadataOnce, { once: true });
        audio.addEventListener("error", handleAudioErrorLocal , { once: true }); 
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
