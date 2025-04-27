import { useState } from "react";
import Controls from "./Manager_Songs/Controls";
import Lyrics from "./Manager_Songs/Lyrics";
import PopularSongs from "./Manager_Songs/PopularSongs";
import Recommendations from "./Manager_Songs/Recommendations";
import SongHeader from "./Manager_Songs/Song-Header";

const ManagerSongSection = () => {
  const [bgColor, setBgColor] = useState("#7D3218"); // màu mặc định

  return (
    <div>
      <div className="container">
        <div className="song_side_profile">
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
