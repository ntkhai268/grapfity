// src/layouts/ProfileLayouts.tsx
import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import ProfileSection from "../components/ProfileSection";
import "../styles/ProfileLayout.css";

const ProfileLayout: React.FC = () => {
  return (
    <div className="main-background">
      <div className="main-layout">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            <ProfileSection /> {/* Thay Section bằng ProfileSection */}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProfileLayout;
