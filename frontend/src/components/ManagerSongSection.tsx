import React, { useState, useEffect, RefObject } from "react";
import Controls from "./Manager_Songs/Controls";
import Lyrics from "./Manager_Songs/Lyrics";
import PopularSongs from "./Manager_Songs/PopularSongs";
import Recommendations from "./Manager_Songs/Recommendations";
import SongHeader from "./Manager_Songs/Song-Header";
import Sidebar from "./Sidebar";

// Import hook useSongManager và kiểu dữ liệu của nó
// Đảm bảo đường dẫn này chính xác đến file hook của bạn
import useSongManager from "../hooks/Manager_Song_Play"; 

// Định nghĩa (hoặc import) kiểu dữ liệu trả về của hook useSongManager
// Kiểu này cần khớp với những gì hook useSongManager thực sự trả về
interface ISongManagerOutput {
  audioRef: RefObject<HTMLAudioElement | null>;
  songUrl: string | undefined;
  isPlaying: boolean;
  togglePlay: () => void;
  currentTrackId?: string | number | null;    // ID bài hát hiện tại từ hook
}


const ManagerSongSection: React.FC = () => {
  const [bgColor, setBgColor] = useState<string>("#7D3218"); // màu mặc định
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  // 1. Sử dụng hook useSongManager để lấy các giá trị cần thiết
  const { 
    currentTrackId, 
    audioRef,      // Lấy audioRef từ hook
    songUrl,       // Lấy songUrl từ hook
    isPlaying,     // Lấy isPlaying từ hook
    togglePlay     // Lấy togglePlay từ hook
  }: ISongManagerOutput = useSongManager();

  const handleSidebarExpandChange = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  useEffect(() => {
    // Log để kiểm tra giá trị currentTrackId mỗi khi nó thay đổi
    console.log("ManagerSongSection - currentTrackId from hook:", currentTrackId);
    console.log("ManagerSongSection - isPlaying from hook:", isPlaying);
  }, [currentTrackId, isPlaying]);

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
              currentTrackId={currentTrackId === undefined ? null : currentTrackId} 
              // currentSong={currentSong} // Ví dụ nếu SongHeader cần thông tin chi tiết bài hát
            />
            <Controls 
              currentTrackId={currentTrackId === undefined ? null : currentTrackId} 
              // Truyền các props điều khiển nhạc xuống Controls
              audioRef={audioRef}
              songUrl={songUrl}
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              
            />
            <Lyrics 
              trackId={currentTrackId === undefined ? null : currentTrackId} 
            />
            <Recommendations/>
            <PopularSongs/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSongSection;
