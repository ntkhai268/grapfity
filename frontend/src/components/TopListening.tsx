import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/TopListening.css";

// Define the type for categories
type Category = "tracks" | "artists" | "genres"

// Define the structure of activeTab state
const TopStats = () => {
  // Local variables for data
  const [activeTab_listening, setActiveTab_listening] = useState<{
    tracks: string
    artists: string
    genres: string
  }>({
    tracks: "last-12-months",
    artists: "last-12-months",
    genres: "last-12-months",
  })

  // Sample data for each category (could be dynamic data from API)
  const data_listening = {
    tracks: [
      { id: 1, name: "Cau 1 - PLDC", streams: 36 },
      { id: 2, name: "Cau 2 - PLDC", streams: 24 },
      { id: 3, name: "Cau 3 - PLDC", streams: 15 },
    ],
    artists: [
      { id: 1, name: "Cau 1 - PLDC", streams: 36 },
      { id: 2, name: "Cau 2 - PLDC", streams: 24 },
      { id: 3, name: "Cau 3 - PLDC", streams: 15 },
    ],
    genres: [
      { id: 1, name: "Cau 1 - PLDC", streams: 36 },
      { id: 2, name: "Cau 2 - PLDC", streams: 24 },
      { id: 3, name: "Cau 3 - PLDC", streams: 15 },
    ],
  }

  const dateRange_listening = "Mar. 2024 - Mar. 2025"

  // Handle tab change with category type
  const handleTabChange_listening = (category: Category, tab: string) => {
    setActiveTab_listening({
      ...activeTab_listening,
      [category]: tab,
    })
  }

  // Render stats for each category
  const renderStatsSection_listening = (title: string, category: Category) => (
    <div className="stats-section">
      <div className="stats-header_listening">
        <h2>{title}</h2>
        <Link to={`/top-${category}`} className="see-more">See more</Link> {/* Link đến trang chi tiết */}
      </div>

      <div className="tabs">
        <button
          className={activeTab_listening[category] === "last-month" ? "active" : ""}
          onClick={() => handleTabChange_listening(category, "last-month")}
        >
          Last month
        </button>
        <button
          className={activeTab_listening[category] === "last-6-months" ? "active" : ""}
          onClick={() => handleTabChange_listening(category, "last-6-months")}
        >
          Last 6 months
        </button>
        <button
          className={activeTab_listening[category] === "last-12-months" ? "active" : ""}
          onClick={() => handleTabChange_listening(category, "last-12-months")}
        >
          Last 12 months
        </button>
      </div>

      <div className="date-range">{dateRange_listening}</div>

      <div className="streams-label">Streams</div>

      <ul className="stats-list">
        {data_listening[category].map(item => (
          <li key={item.id} className="stats-item">
            <div className="item-info">
              <div className="item-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" fill="#666666" />
                  <path
                    d="M7 14.5C7 13.12 8.12 12 9.5 12C10.88 12 12 13.12 12 14.5C12 15.88 10.88 17 9.5 17C8.12 17 7 15.88 7 14.5Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div className="item-name">{item.name}</div>
            </div>
            <div className="item-streams">{item.streams}</div>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="top-stats-container">
      {renderStatsSection_listening("Top Track", "tracks")}
      {renderStatsSection_listening("Top Artists", "artists")}
      {renderStatsSection_listening("Top Genres", "genres")}
    </div>
  )
}

export default TopStats
