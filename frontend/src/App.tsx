// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Homepage from "./container/HomePage";
// import Profile from "./container/ProfilePage";

import HomeLayout from "./layouts/HomeLayouts";
import ProfileLayout from "./layouts/ProfileLayouts";
import ManagerSongLayout from "./layouts/ManagerSongLayout";
import ManagerPlaylistLayout from "./layouts/ManagerPlaylistLayout";

const App: React.FC = () => {
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
    </Routes>
  );
};

export default App;
