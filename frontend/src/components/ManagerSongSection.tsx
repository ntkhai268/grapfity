import { useState } from "react";
import Controls from "./Manager_Songs/Controls";
import Lyrics from "./Manager_Songs/Lyrics";
import PopularSongs from "./Manager_Songs/PopularSongs";
import Recommendations from "./Manager_Songs/Recommendations";
import SongHeader from "./Manager_Songs/Song-Header";

import Sidebar from "./Sidebar";

const ManagerSongSection = () => {
  const [bgColor, setBgColor] = useState("#7D3218"); // màu mặc định
  
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const handleSidebarExpandChange = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

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
            <SongHeader onColorExtract={setBgColor} />
            <Controls />
            <Lyrics />
            <Recommendations />
            <PopularSongs />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSongSection;
