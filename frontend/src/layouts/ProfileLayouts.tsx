import React, { ReactNode } from "react";
import Header from "../components/Header"; // Assuming Header component exists
import Sidebar from "../components/Sidebar"; // Assuming Sidebar component exists
import Footer from "../components/Footer"; // Assuming Footer component exists
import ProfileSection from "../components/ProfileSection"; // Assuming ProfileSection component exists
import "../styles/ProfileLayout.css"; // Ensure you have the corresponding CSS file for layout

interface ProfileLayoutProps {
  children: ReactNode; // Define children prop as ReactNode
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
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
