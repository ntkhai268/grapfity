// src/layouts/ProfileLayouts.tsx
import React, { useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import ProfileSection from "../components/ProfileSection";
import "../styles/ProfileLayout.css";

const ProfileLayout: React.FC = () => {
  useEffect(() => {
    import("../hooks/Trans_Tab").then((module) => {
      if (typeof module.initTabs === "function") {
        module.initTabs(); // Gọi lại tab init mỗi khi vào profile
      }
    });
  }, []);
  return (
    <div className="main-background">
      <div className="main-layout">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            <ProfileSection /> {/* This will render the ProfileSection component */}
            {children} {/* This will render the children passed to the layout (like ProfilePage content) */}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProfileLayout;
