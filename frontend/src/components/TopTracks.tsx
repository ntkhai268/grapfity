import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng
import "../styles/TopTracksLis.css";

interface Track {
  id: number;
  name: string;
  artist: string;
  image: string;
  plays: number;
}

const TopTracksLis: React.FC = () => {
  // Local state for the time filter with _tracklis suffix
  const [timeFilter_tracklis, setTimeFilter_tracklis] = useState("Last 7 days");

  // Sử dụng useNavigate để điều hướng
  const navigate = useNavigate(); 

  // Sample data for the tracks with _tracklis suffix
  const tracks_tracklis: Track[] = [
    {
      id: 1,
      name: "Cau 1",
      artist: "PLDC",
      image: "/placeholder.svg?height=60&width=60",
      plays: 1,
    },
    {
      id: 2,
      name: "Cau 11",
      artist: "PLDC",
      image: "/placeholder.svg?height=60&width=60",
      plays: 0,
    },
    {
      id: 3,
      name: "Cau 1",
      artist: "PLDC",
      image: "/placeholder.svg?height=60&width=60",
      plays: 1,
    },
    {
      id: 4,
      name: "Cau 11",
      artist: "PLDC",
      image: "/placeholder.svg?height=60&width=60",
      plays: 0,
    },
    {
      id: 5,
      name: "Cau 1",
      artist: "PLDC",
      image: "/placeholder.svg?height=60&width=60",
      plays: 1,
    },
  ];

  // Stats data with _tracklis suffix
  const stats_tracklis = {
    plays: 1,
    likes: 0,
    comments: 1,
    reposts: 0,
    downloads: 0,
  };

  // Hàm xử lý sự kiện nhấn nút quay lại
  const handleBackButtonClick = () => {
    navigate("/upload");  // Điều hướng trở lại trang /upload
  };

  return (
    <div className="listening-container_tracklis">
      <h1 className="listening-title_tracklis">Top tracks on Graptify</h1>

      <div className="top-section_tracklis">
        <button className="back-button_tracklis" onClick={handleBackButtonClick}>
          <span>&#8249;</span>  {/* Nút quay lại */}
        </button>
        <h2 className="section-title_tracklis">Top tracks</h2>
        <div className="filter-dropdown_tracklis">
          <span>{timeFilter_tracklis}</span>
          <span className="dropdown-arrow_tracklis">&#9662;</span>
        </div>
      </div>

      <div className="stats-bar_tracklis">
        <div className="stat-item_tracklis play-stat_tracklis">
          <span className="play-icon_tracklis">▶</span>
          <span>{stats_tracklis.plays} play</span>
        </div>
        <div className="stat-item_tracklis">
          <span className="heart-icon_tracklis">♡</span>
          <span>{stats_tracklis.likes} likes</span>
        </div>
        <div className="stat-item_tracklis">
          <span className="comment-icon_tracklis">💬</span>
          <span>{stats_tracklis.comments} comment</span>
        </div>
        <div className="stat-item_tracklis">
          <span className="repost-icon_tracklis">↺</span>
          <span>{stats_tracklis.reposts} reposts</span>
        </div>
        <div className="stat-item_tracklis">
          <span className="download-icon_tracklis">↓</span>
          <span>{stats_tracklis.downloads} downloads</span>
        </div>
      </div>

      <div className="tracks-table_tracklis">
        <div className="table-header_tracklis">
          <div className="header-cell_tracklis time-period_tracklis">Last 7 days</div>
          <div className="header-cell_tracklis plays-header_tracklis">Plays</div>
        </div>

        <div className="tracks-list_tracklis">
          {tracks_tracklis.map((track) => (
            <div key={track.id} className="track-item_tracklis">
              <div className="track-info_tracklis">
                <div className="track-image_tracklis">
                  <img src={track.image || "/placeholder.svg"} alt={track.name} />
                </div>
                <div className="track-details_tracklis">
                  <div className="track-name_tracklis">
                    {track.name} - {track.artist}
                  </div>
                </div>
              </div>
              <div className="track-plays_tracklis">{track.plays}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopTracksLis;
