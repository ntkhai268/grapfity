import React, { useState } from "react";
import { Link } from "react-router-dom";  // Thêm Link từ react-router-dom
import "/Users/dangkhoii/Documents/Graptify/frontend/src/styles/TopUpload.css";

const TopUpload: React.FC = () => {
  // Time tab state
  const [activeTimeTab, setActiveTimeTab] = useState("last12months");

  // Track and listener data
  const tracks = [
    { id: 1, title: "Cau 1 - PLDC", streams: 36, time: "5:20" },
    { id: 2, title: "Cau 2 - PLDC", streams: 24, time: "3:45" },
    { id: 3, title: "Cau 3 - PLDC", streams: 15, time: "4:10" },
  ];

  const listener = {
    name: "Phạm Huy",
    plays: 1,
    followers: 0,
    avatar: "/placeholder.svg?height=80&width=80",
  };

  const handleTimeTabClick = (tab: string) => {
    setActiveTimeTab(tab);
  };

  return (
    <div className="top-upload-container">
      <div className="top-tracks-section">
        <div className="section-header">
          <h2>Top tracks on Graptify</h2>
          <Link to="/top-tracks-page" className="see-more">See more</Link> {/* Thay span bằng Link */}
        </div>

        <div className="time-tabs">
          <button
            className={activeTimeTab === "lastMonth" ? "active" : ""}
            onClick={() => handleTimeTabClick("lastMonth")}
          >
            Last month
          </button>
          <button
            className={activeTimeTab === "last6months" ? "active" : ""}
            onClick={() => handleTimeTabClick("last6months")}
          >
            Last 6 months
          </button>
          <button
            className={activeTimeTab === "last12months" ? "active" : ""}
            onClick={() => handleTimeTabClick("last12months")}
          >
            Last 12 months
          </button>
        </div>

        <div className="section-header">
          <div className="date-range">Mar. 2024 - Mar. 2025</div>
          <div className="track-streams">Streams</div>
        </div>

        <div className="tracks-list">
          {tracks.map((track) => (
            <div key={track.id} className="track-item">
              <div className="track-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"
                    fill="white"
                  />
                </svg>
              </div>
              <div className="track-info">
                <span className="track-title">{track.title}</span>
              </div>
              <div className="track-time">{track.time}</div> {/* Hiển thị thời gian phát */}
            </div>
          ))}
        </div>
      </div>

      <div className="top-listeners-section">
        <h2>Top listeners</h2>

        <div className="listener-tabs">
          <button className="active">Last 7 days</button>
        </div>

        <div className="listener-profile">
          <img src={listener.avatar || "/placeholder.svg"} alt="Listener avatar" className="listener-avatar" />
          <div className="listener-info">
            <div className="listener-name">{listener.name}</div>
            <div className="listener-stats">
              <span className="play-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
                {listener.plays} play
              </span>
              <span className="followers-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    fill="currentColor"
                  />
                </svg>
                {listener.followers} followers
              </span>
            </div>
          </div>
        </div>

        <div className="pro-message">Meet the rest of your listeners with Artist Pro</div>
      </div>
    </div>
  );
};

export default TopUpload;
