// src/layouts/ManagerPlaylistLayout.tsx
import React, {useEffect} from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import ManagerPlaylistSection from "../components/ManagerPlaylistSection";
import "../styles/ManagerPlaylistLayout.css";

const ManagerPlaylistLayout: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>(); // ⬅️ lấy từ URL
  const numericId = Number(playlistId);
  useEffect(() => {
      document.body.classList.add("managerPlaylist-page");
      return () => {
        document.body.classList.remove("managerPlaylist-page");
      };
    }, []);
  return (
    <div className="main-background">
      <div className="main-layout">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            {playlistId ? (
              <ManagerPlaylistSection playlistId={numericId} />
            ) : (
              <div>Không có playlistId được cung cấp.</div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ManagerPlaylistLayout;
