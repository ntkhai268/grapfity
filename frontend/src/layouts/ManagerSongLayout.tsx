// src/layouts/ProfileLayouts.tsx
import React, { useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../styles/ManagerSongLayout.css";
import { Outlet } from "react-router-dom";

const ManagerSongLayout: React.FC = () => {
  useEffect(() => {
    import("../hooks/Trans_Tab").then((module) => {
      if (typeof module.initTabs === "function") {
        module.initTabs(); // Gọi lại tab init mỗi khi vào profile
      }
    });
  }, []);
  useEffect(() => {
    document.body.classList.add("managersong-page");
    return () => {
      document.body.classList.remove("managersong-page");
    };
  }, []);
  return (
    <div className="main-background">
      <div className="main-layout">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
              <Outlet /> 
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ManagerSongLayout;