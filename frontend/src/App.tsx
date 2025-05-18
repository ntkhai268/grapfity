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
import TopTracksPage from "./container/TopTracksPage";

import UploadLayouts from "./layouts/UploadLayouts";
import StatsLayouts from "./layouts/StatsLayouts";
import ListeningLayouts from "./layouts/ListeningLayouts";

import LoginForm from "./container/Login";  // Đảm bảo có nhập đúng đường dẫn
import LoginLayout from "./layouts/LoginLayouts";  // Layout dành cho trang đăng nhập
import SearchPage from "./container/SearchPage";

import AdminLayout from "./layouts/adminlayouts"
import Section_admin from "./components/section_admin"
import Section_admin_tracks from "./components/section_admin_tracks"
import Section_admin_users from "./components/section_admin_users"
import Section_admin_profile from "./components/section_admin_statistical"

const App = () => {
  return (
    <Routes>
      {/* ✅ Tự chuyển hướng từ / sang /mainpage */}
      {/* Chuyển hướng từ / đến /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Trang đăng nhập với Login Layout */}
      <Route
        path="/login"
        element={
          <LoginLayout>
            <LoginForm /> {/* Trang đăng nhập */}
          </LoginLayout>
        }
      />
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
      <Route path="/top-tracks-page" element={<SeeMoreLayouts><TopTracksPage /></SeeMoreLayouts>} />
      <Route path="/search" element={<SearchPage />} />

      <Route
        path="/admin"
        element={
          <AdminLayout>
            <Section_admin_profile />              {/* Trang mặc định */}
          </AdminLayout>
        }
      /> 
      <Route
        path="/admin/lis_tracks"
        element={
          <AdminLayout>
            <Section_admin />              {/* Trang mặc định */}
          </AdminLayout>
        }
      />
      <Route
        path="/admin/tracks"
        element={
          <AdminLayout>
            <Section_admin_tracks />       {/* Trang Bài hát chờ duyệt */}
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <Section_admin_users />        {/* Trang Quản lý người dùng */}
          </AdminLayout>
        }
      />

    </Routes>
  );
};



export default App;

