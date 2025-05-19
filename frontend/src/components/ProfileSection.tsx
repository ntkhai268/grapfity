// import React from "react";
// import Header from "./Header";
import { useParams } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import  { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Tab from "./UI_Profile/Tab";
// import Footer from "./Footer";
import SongRight from "./UI_Profile/Song_right";
import Song from "./UI_Profile/All";
import PopularTracks from "./UI_Profile/Popular_Tracks";
import Tracks from "./UI_Profile/Tracks";
import Playlists from "./UI_Profile/Playlist";

import ProfileSlide from "./UI_Profile/Profile_Slide";
import ProfileStat from "./UI_Profile/Profile_Stats";


import "../styles/ProfileLayout.css";



const ProfileSection = () => {
  // Lấy userId trong URL (profile đang xem)
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const safeProfileUserId: string | number = profileUserId ?? "";
  const [profileBgColor, setProfileBgColor] = useState<string>("#f2f2f2");

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const handleSidebarExpandChange = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

   useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user?.id) {
        setCurrentUserId(user.id);
      }
    };

    fetchUser();
  }, []);
  return (
    <div>
      <div className="container">
        
      <Sidebar onExpandChange={handleSidebarExpandChange} />
        <div className={`song_side_profile ${sidebarExpanded ? "shrink" : ""}`}>
            {/* -------------------------UI profile------------------------------------------- */}
            <div className="profile_slide" style={{ background: `linear-gradient(to bottom, ${profileBgColor}, #454545  50%)`,}}>
               <ProfileSlide onColorExtract={setProfileBgColor} />

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
                    <Playlists viewedUserId={safeProfileUserId} currentUserId={currentUserId ?? ""} />
                    </div>

                    <SongRight />
                </div>
            </div>
           
        </div>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default ProfileSection;
