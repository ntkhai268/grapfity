import React, { useState, useEffect, RefObject } from "react";
import { useLocation,useParams } from "react-router-dom";
import Controls from "./Manager_Songs/Controls";
import Lyrics from "./Manager_Songs/Lyrics";
import PopularSongs from "./Manager_Songs/PopularSongs";
import Recommendations from "./Manager_Songs/Recommendations";
import SongHeader from "./Manager_Songs/Song-Header";
import Sidebar from "./Sidebar";

import { decodeBase62WithPrefix  } from "../hooks/base62";


// Import hook useSongManager và kiểu dữ liệu của nó
// Đảm bảo đường dẫn này chính xác đến file hook của bạn
import useSongManager from "../hooks/Manager_Song_Play"; 
import GlobalAudioManager, { Song } from "../hooks/GlobalAudioManager";
// console.log('[DEBUG] GlobalAudioManager - Current Song:', GlobalAudioManager.getCurrentSong());
// console.log('[DEBUG] GlobalAudioManager - Current Context:', GlobalAudioManager.getCurrentContext());



// Định nghĩa (hoặc import) kiểu dữ liệu trả về của hook useSongManager
// Kiểu này cần khớp với những gì hook useSongManager thực sự trả về
interface ISongManagerOutput {
  audioRef: RefObject<HTMLAudioElement | null>;
  songUrl: string | undefined;
  isPlaying: boolean;

  currentTrackId?: string | number | null;    // ID bài hát hiện tại từ hook
}


const ManagerSongSection: React.FC = () => {
  const { trackId } = useParams();
  const decodedId = decodeBase62WithPrefix(trackId ?? "0"); 
  
  const [bgColor, setBgColor] = useState<string>("#7D3218"); // màu mặc định
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  
  const location = useLocation();
  const songFromState = location.state?.currentSong;
  const [viewSong, setViewSong] = useState(songFromState || null);
  const playlistFromState = location.state?.songs;
  const indexFromState = location.state?.currentIndex;
  const [, setPlaylist] = useState<Song[]>(playlistFromState || []);
  
   const [, setPlaylistIndex] = useState<number>(
    indexFromState !== undefined ? indexFromState : 0
  );

  // 1. Sử dụng hook useSongManager để lấy các giá trị cần thiết
  const { 
    currentTrackId, 
    audioRef,      // Lấy audioRef từ hook
    songUrl,       // Lấy songUrl từ hook
    isPlaying  // Lấy isPlaying từ hook
  // Lấy togglePlay từ hook
  }: ISongManagerOutput = useSongManager();

  const handleSidebarExpandChange = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  useEffect(() => {
    // Log để kiểm tra giá trị currentTrackId mỗi khi nó thay đổi
    // console.log("ManagerSongSection - currentTrackId from hook:", currentTrackId);
    // console.log("ManagerSongSection - isPlaying from hook:", isPlaying);
  }, [currentTrackId, isPlaying]);
  useEffect(() => {
    // Ưu tiên lấy từ location.state nếu có
    let playlist = location.state?.songs;
    let index = location.state?.currentIndex;
    let song = location.state?.currentSong;
    let context = location.state?.context;

    // Nếu GlobalAudioManager chưa có gì, thì set lại
    if (!GlobalAudioManager.getCurrentSong() && playlist && song && typeof index === 'number') {
      GlobalAudioManager.setPlaylist(playlist, index, context);
      setTimeout(() => {
      console.log('[DEBUG] Global after set:', GlobalAudioManager.getCurrentSong());
      console.log('[DEBUG] Global playlist after set:', GlobalAudioManager.getPlaylist());
    }, 100);
      // Controls sẽ có đủ songUrl ngay sau đó!
    }
  }, [location.state]);

  useEffect(() => {
    if (!songFromState) {
      const songStr = localStorage.getItem("viewedSong");
      const listStr = localStorage.getItem("viewedPlaylist");
      const indexStr = localStorage.getItem("viewedIndex");

    try {
      if (songStr) setViewSong(JSON.parse(songStr));
      if (listStr) setPlaylist(JSON.parse(listStr));
      if (indexStr) setPlaylistIndex(parseInt(indexStr));
      console.log('[DEBUG] Lấy từ localStorage:', {
        song: songStr,
        playlist: listStr,
        index: indexStr
      });
    } catch (e) {
      console.error("Lỗi parse từ localStorage:", e);
    }
  }
}, [songFromState]);
useEffect(() => {
  if (!viewSong && trackId) {
    const decodedId = decodeBase62WithPrefix(trackId);
    console.log("[FALLBACK] Decode từ URL:", decodedId);

    const song = GlobalAudioManager.getPlaylist().find(s => s.id === decodedId);
    if (song) {
      console.log("[FALLBACK] Tìm thấy trong GlobalAudioManager:", song);
      setViewSong(song);
    } else {
      fetch(`http://localhost:8001/api/tracks/${decodedId}`) // 👈 thay đúng host của backend bạn
        .then(res => res.ok ? res.json() : Promise.reject("Không tìm thấy"))
        .then(data => {
          console.log("[FALLBACK] Tìm thấy bài hát qua API:", data);
          setViewSong(data);
        })
        .catch(err => {
          console.error("[FALLBACK] Không load được bài hát:", err);
        });
    }
  }
}, [trackId, viewSong]);

// useEffect(() => {
//   if (playlist.length > 0 && viewSong) {
//     console.log("🧪 Playlist được truyền vào ManagerSongSection:", playlist.map(s => s.id));
//     const context = {
//       id: `manager-${viewSong.id}`,
//       type: "queue"
//     };
//     GlobalAudioManager.setPlaylist(playlist, playlistIndex, context);
//   }
// }, [playlist, playlistIndex, viewSong]);




useEffect(() => {
  const song = location.state?.currentSong;
  if (song && (!viewSong || song.id !== viewSong.id)) {
    setViewSong(song);
  }
}, [location.state?.currentSong]);

useEffect(() => {
  console.log("🔁 ManagerSongSection reloaded:", location.state?._forceKey);
}, [location.state?._forceKey]);

if (!viewSong) {
  return (
    <div style={{ color: 'white', padding: 32 }}>
      ⏳ Đang tải bài hát (decodedId: {decodedId})...
    </div>
  );
}
  return (
    <div>
      <div className="container">
        <Sidebar onExpandChange={handleSidebarExpandChange} />
        <div className={`song_side_managerment ${sidebarExpanded ? "shrink" : ""}`}>
          <div
            className="Management_song"
            style={{
              background: `linear-gradient(to bottom, ${bgColor}, var(--spotify-black) 50%)`,
            }}
          >
            {/* 2. Truyền các giá trị xuống component con nếu chúng cần */}
            <SongHeader 
              onColorExtract={setBgColor} 
              currentTrackId={viewSong?.id ?? null}
              // currentSong={currentSong} // Ví dụ nếu SongHeader cần thông tin chi tiết bài hát
            />
            <Controls 
              currentTrackId={currentTrackId === undefined ? null : currentTrackId} 
              // Truyền các props điều khiển nhạc xuống Controls
              audioRef={audioRef}
              songUrl={songUrl}
              isPlaying={isPlaying}
              
               trackId={viewSong?.id ?? null}
              //  playlistIndex={playlistIndex}
              
            />
            <Lyrics trackId={viewSong?.id ?? null} />
            <Recommendations trackId={viewSong?.id ?? null}/>
            <PopularSongs trackId={viewSong?.id ?? null}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSongSection;