import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Homepage from "./container/HomePage";
import Profile from "./container/ProfilePage";
import StatsPage from "./container/StatsPage";

import HomeLayout from "./layouts/HomeLayouts";
import ProfileLayout from "./layouts/ProfileLayouts";

import { PlayerProvider } from "./context/PlayerContext";

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <Routes>
        {/* 🔁 Tự chuyển hướng từ / sang /mainpage */}
        <Route path="/" element={<Navigate to="/mainpage" replace />} />

        <Route
          path="/mainpage"
          element={
            <HomeLayout>
              <Homepage />
            </HomeLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProfileLayout>
              <Profile />
            </ProfileLayout>
          }
        />

        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </PlayerProvider>
  );
};

export default App;
