import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Homepage from "./container/HomePage";
// import Profile from "./container/ProfilePage";

import HomeLayout from "./layouts/HomeLayouts";
import ProfileLayout from "./layouts/ProfileLayouts";
import ManagerSongLayout from "./layouts/ManagerSongLayout";
import ManagerPlaylistLayout from "./layouts/ManagerPlaylistLayout";

import SeeMoreLayouts from "./layouts/SeeMoreLayouts";  // Import layout
import TopArtistsLisPage from "./container/TopArtistsLisPage";  // Import các trang
import TopTracksLisPage from "./container/TopTracksLisPage";
import TopGenresLisPage from "./container/TopGenresLisPage";
import TopTracksPage from "./container/TopTracksPage";

import UploadLayouts from "./layouts/UploadLayouts";
import StatsLayouts from "./layouts/StatsLayouts";
import ListeningLayouts from "./layouts/ListeningLayouts";

const App = () => {
  return (
    <Routes>
      {/* ✅ Tự chuyển hướng từ / sang /mainpage */}
      <Route path="/" element={<Navigate to="/mainpage" replace />} />

      <Route
        path="/mainpage"
        element={
          <HomeLayout>
            <Homepage />
          </HomeLayout>
        }
      />

      {/* <Route
        path="/profile"
        element={
          <ProfileLayout>
            <Profile />
          </ProfileLayout>
        }
      /> */}
      <Route
        path="/profile"
        element={<ProfileLayout />}
      />
      <Route
        path="/ManagerSong"
        element={<ManagerSongLayout />}
      />
      <Route
        path="/ManagerPlaylistLayout/:playlistId"
        element={<ManagerPlaylistLayout />}
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
  );
};



export default App;

