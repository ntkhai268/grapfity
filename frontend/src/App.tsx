import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Nhập các layout
import HomeLayout from "./layouts/HomeLayouts";
import ProfileLayout from "./layouts/ProfileLayouts"; // Nhập ProfileLayout
import ListeningLayouts from "./layouts/ListeningLayouts";
import UploadLayouts from "./layouts/UploadLayouts";
import StatsLayouts from "./layouts/StatsLayouts";

// Nhập PlayerContext để bao bọc các routes
import { PlayerProvider } from "./context/PlayerContext";

import SeeMoreLayouts from "./layouts/SeeMoreLayouts";  // Import layout
import TopArtistsLisPage from "./container/TopArtistsLisPage";  // Import các trang
import TopTracksLisPage from "./container/TopTracksLisPage";
import TopGenresLisPage from "./container/TopGenresLisPage";
import TopTracksPage from "./container/TopTracksPage";

const App = () => {
  return (
    <PlayerProvider>
      <Routes>
        {/* Chuyển hướng từ / đến /upload */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Trang home với Home Layout */}
        <Route
          path="/home"
          element={
            <HomeLayout>
              {/* Nội dung trang home */}
              <div>Home Page Content</div>
            </HomeLayout>
          }
        />

        {/* Trang profile với Profile Layout */}
        <Route
          path="/profile"
          element={
            <ProfileLayout>
              {/* Nội dung của trang profile */}
              <div>Profile Page Content</div> {/* Nội dung này sẽ được render trong ProfileLayout */}
            </ProfileLayout>
          }
        />

        {/* Trang stats */}
        <Route path="/stats/*" element={<StatsLayouts />} />

        {/* Trang upload với Upload Layout */}
        <Route path="/upload/*" element={<UploadLayouts />} />

        {/* Trang listening với Listening Layout */}
        <Route path="/listening/*" element={<ListeningLayouts />} />
        {/* Các route bọc trong SeeMoreLayouts để sử dụng chung Nav */}
      <Route path="/top-artists" element={<SeeMoreLayouts><TopArtistsLisPage /></SeeMoreLayouts>} />
      <Route path="/top-tracks" element={<SeeMoreLayouts><TopTracksLisPage /></SeeMoreLayouts>} />
      <Route path="/top-genres" element={<SeeMoreLayouts><TopGenresLisPage /></SeeMoreLayouts>} />
      <Route path="/top-tracks-page" element={<SeeMoreLayouts><TopTracksPage /></SeeMoreLayouts>} />
      </Routes>
    </PlayerProvider>
  );
};



export default App;

