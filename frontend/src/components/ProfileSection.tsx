import { useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { getCurrentUser } from '../services/authService';

import Sidebar from "./Sidebar";
import Tab from "./UI_Profile/Tab";
import SongRight from "./UI_Profile/Song_right";
import Song from "./UI_Profile/All";
import PopularTracks from "./UI_Profile/Popular_Tracks";
import Tracks from "./UI_Profile/Tracks";
import Playlists from "./UI_Profile/Playlist";
import ProfileSlide from "./UI_Profile/Profile_Slide";
import ProfileStat from "./UI_Profile/Profile_Stats";

import "../styles/ProfileLayout.css";

const ProfileSection = () => {
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const [profileBgColor, setProfileBgColor] = useState<string>("#f2f2f2");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log("✅✅✅✅✅DEBUG getCurrentUser() trả về:", user);
        if (user?.id) setCurrentUserId(user.id);
      } catch (err) {
        console.error("✅✅✅✅✅Không thể lấy current user, người dùng chưa đăng nhập:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Chỉ render khi đã có currentUserId (id thật)
  // if (!currentUserId) {
  //   return <div>Đang tải hồ sơ...</div>;
  // }

  // const viewedUserId = profileUserId ? profileUserId : currentUserId;
  // console.log("✅✅✅✅✅test ở profile section, TRƯỚC")
  if (!profileUserId && !currentUserId) {
    console.log("✅ BẮT ĐẦU RENDER PROFILE SECTION", { profileUserId, currentUserId });
    return (
      <div style={{ color: 'white' }}>
        Bạn cần đăng nhập để xem hồ sơ của mình.
      </div>
    );
  }



  // Nếu vào profile người khác (có param), hoặc vào profile mình (có currentUserId)
  // viewedUserId luôn chắc chắn là string | number ở đây
  const viewedUserId: string | number = profileUserId ? profileUserId : (currentUserId as string | number);
  return (
    <div>
      <div className="container">
        <Sidebar onExpandChange={setSidebarExpanded} />
        <div className={`song_side_profile ${sidebarExpanded ? "shrink" : ""}`}>
          <div className="profile_slide" style={{ background: `linear-gradient(to bottom, ${profileBgColor}, #454545 50%)` }}>
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
                <Song viewedUserId={viewedUserId} currentUserId={currentUserId ?? ""} />
                <PopularTracks viewedUserId={viewedUserId} currentUserId={currentUserId ?? ""} />
                <Tracks viewedUserId={viewedUserId} currentUserId={currentUserId ?? ""} />
                <Playlists viewedUserId={viewedUserId} currentUserId={currentUserId ??""} />
              </div>
              <SongRight viewedUserId={viewedUserId} currentUserId={currentUserId ?? ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;