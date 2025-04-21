import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng
import "../styles/TopGenresLis.css";

interface Genre {
  id: number;
  name: string;
  percentage: number;
}

const TopGenresList: React.FC = () => {
  // Local state for the time filter
  const [timeFilter_genres, setTimeFilter_genres] = useState("Last 7 days");

  // Sử dụng useNavigate để điều hướng
  const navigate = useNavigate();

  // Sample data for the genres with _genres suffix
  const genres_genres: Genre[] = [
    { id: 1, name: "Hip Hop", percentage: 35.7 },
    { id: 2, name: "Pop", percentage: 26.1 },
    { id: 3, name: "Latin", percentage: 20.7 },
    { id: 4, name: "Electronic", percentage: 5.4 },
    { id: 5, name: "R&B", percentage: 5.0 },
    { id: 6, name: "Easy listening", percentage: 3.7 },
    { id: 7, name: "World/Traditional", percentage: 2.9 },
    { id: 8, name: "Jazz", percentage: 0.4 },
  ];

  // Stats data with _genres suffix
  const stats_genres = {
    plays: 1,
    likes: 0,
    comments: 1,
    reposts: 0,
    downloads: 0,
  };

  // Hàm xử lý sự kiện nhấn nút quay lại
  const handleBackButtonClick = () => {
    navigate("/listening"); // Điều hướng trở lại trang /listening
  };

  return (
    <div className="listening-container_genres">
      <h1 className="listening-title_genres">Listening</h1>

      <div className="top-section_genres">
        <button className="back-button_genres" onClick={handleBackButtonClick}>
          <span>&#8249;</span>  {/* Nút quay lại */}
        </button>
        <h2 className="section-title_genres">Top Genres</h2>
        <div className="filter-dropdown_genres">
          <span>{timeFilter_genres}</span>
          <span className="dropdown-arrow_genres">&#9662;</span>
        </div>
      </div>

      <div className="stats-bar_genres">
        <div className="stat-item_genres play-stat_genres">
          <span className="play-icon_genres">▶</span>
          <span>{stats_genres.plays} play</span>
        </div>
        <div className="stat-item_genres">
          <span className="heart-icon_genres">♡</span>
          <span>{stats_genres.likes} likes</span>
        </div>
        <div className="stat-item_genres">
          <span className="comment-icon_genres">💬</span>
          <span>{stats_genres.comments} comment</span>
        </div>
        <div className="stat-item_genres">
          <span className="repost-icon_genres">↺</span>
          <span>{stats_genres.reposts} reposts</span>
        </div>
        <div className="stat-item_genres">
          <span className="download-icon_genres">↓</span>
          <span>{stats_genres.downloads} downloads</span>
        </div>
      </div>

      <div className="genres-chart_genres">
        {genres_genres.map((genre) => (
          <div key={genre.id} className="genre-item_genres">
            <div className="genre-name_genres">{genre.name}</div>
            <div className="genre-bar-container_genres">
              <div className="genre-bar_genres" style={{ width: `${genre.percentage}%` }}></div>
            </div>
            <div className="genre-percentage_genres">{genre.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopGenresList;
