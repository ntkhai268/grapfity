// import React from "react";
// import Header from "./Header";
// import Sidebar from "./Sidebar";
import Tab from "./UI_Profile/Tab";
// import Footer from "./Footer";
import SongRight from "./UI_Profile/Song_right";
import Song from "./UI_Profile/All";
import PopularTracks from "./UI_Profile/Popular_Tracks";
import Tracks from "./UI_Profile/Tracks";
import Playlists from "./UI_Profile/Playlist";

import ProfileSlide from "./UI_Profile/Profile_Slide";
import ProfileStat from "./UI_Profile/Profile_Stats";

// import css

// import "../styles/ProfileSlide.css";
// import "../styles/Song_Side.css";
// import "../styles/MidSection.css";
// import "../styles/BottomSection.css";
import "../styles/ProfileLayout.css";



const ProfileSection = () => {
  return (
    <div>
      <div className="container">
        {/* <Header />
        <Sidebar /> */}
        <div className="song_side_profile">
            {/* -------------------------UI profile------------------------------------------- */}
            <div className="profile_slide">
                <ProfileSlide />

                <div className="mid_section_profile">
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
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default ProfileSection;
