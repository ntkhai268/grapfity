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

  const viewedUserId = profileUserId ?? "me"; 
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const safeProfileUserId: string | number = profileUserId ?? "";
  const [profileBgColor, setProfileBgColor] = useState<string>("#f2f2f2");

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const handleSidebarExpandChange = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

   useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log("tet ở profile user getCurrentUser:", user);
        if (user?.id) setCurrentUserId(user.id);
      } catch (err) {
        console.error("Không thể lấy current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);
  console.log(" trong profileSection viewedUserId :", viewedUserId)
  console.log(" trong profileSection profileUserId :", profileUserId)
  return (
    <div>
      <div className="container">
        
      <Sidebar onExpandChange={handleSidebarExpandChange} />
        <div className={`song_side_profile ${sidebarExpanded ? "shrink" : ""}`}>
            {/* -------------------------UI profile------------------------------------------- */}
            <div className="profile_slide" style={{ background: `linear-gradient(to bottom, ${profileBgColor}, #454545  50%)`,}}>
               <ProfileSlide
                viewedUserId={viewedUserId}
                currentUserId={currentUserId}
                onColorExtract={setProfileBgColor}
              />

                <div className="mid_section_profile">
                    <Tab />
                    <ProfileStat />

                    
                </div>

                <div className="bottom_section">
                    <div className="left_section">
                    <Song viewedUserId={viewedUserId} currentUserId={currentUserId ?? ""}/>
                    <PopularTracks viewedUserId={viewedUserId} currentUserId={currentUserId ?? ""}/>
                    <Tracks viewedUserId={viewedUserId} currentUserId={currentUserId ?? ""}/>
                    <Playlists viewedUserId={viewedUserId} currentUserId={currentUserId ?? ""} />
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
