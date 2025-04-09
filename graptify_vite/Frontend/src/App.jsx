import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Tab from "./components/Tab";
import Footer from "./components/Footer";
import SongRight from "./components/Song_right";
import Song from "./components/All";
import PopularTracks from "./components/Popular_Tracks";
import Tracks from "./components/Tracks";
import Playlists from "./components/Playlist";

// Manager Profile Components
import ProfileSlide from "./components/Manager_Profile/Profile_Slide";
import ProfileStat from "./components/Manager_Profile/Profile_Stats";

// --------------------------------------------------------------
import SongHeader from "./components/Manager_Songs/Song-Header";
import Controls from "./components/Manager_Songs/Controls";
import Lyrics from "./components/Manager_Songs/Lyrics";
import Recommendations from "./components/Manager_Songs/Recommendations";
import PopularSongs from "./components/Manager_Songs/PopularSongs";

const App = () => {
  return (
    <div>
      <div className="container">
        <Header />
        <Sidebar />

        <div className="song_side">
            {/* -------------------------UI profile------------------------------------------- */}
            <div className="profile_slide">
                <ProfileSlide />

                <div className="mid_section">
                    <Tab />
                    <ProfileStat />

                    <div className="tabs_below">
                        <span>Recent</span>
                    </div>
                </div>

                <div className="bottom_section">
                    <div className="left_section">
                    <Song />
                    <PopularTracks />
                    <Tracks />
                    <Playlists />
                    </div>

                    <SongRight />
                </div>
            </div>
            {/* -------------------------UI quản lí bài hát---------------------------------------- */}
           {/* <div className="Management_song">
                <SongHeader />
                <Controls />
                <Lyrics />
                <Recommendations />
                <PopularSongs />
            </div>  */}
            {/* -------------------------------------------------------------------- */}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default App;
