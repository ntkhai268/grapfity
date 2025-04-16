// import React from "react";
// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";
// import Footer from "../components/Footer";
import Controls
from "./Manager_Songs/Controls";
import Lyrics from "./Manager_Songs/Lyrics";
import PopularSongs from "./Manager_Songs/PopularSongs";
import Recommendations from "./Manager_Songs/Recommendations";
import SongHeader from "./Manager_Songs/Song-Header";


// import "../styles/ManagerSongLayout.css";





const ManagerSongSection = () => {
  return (
    <div>
      <div className="container">
        {/* <Header />
        <Sidebar /> */}
        <div className="song_side_profile">
                
            {/* -------------------------UI quản lí bài hát---------------------------------------- */}
           <div className="Management_song">
                <SongHeader />
                <Controls />
                <Lyrics />
                <Recommendations />
                <PopularSongs />
            </div> 
            {/* -------------------------------------------------------------------- */}
        </div>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default ManagerSongSection;
