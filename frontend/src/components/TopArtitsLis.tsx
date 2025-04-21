import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng
import "../styles/TopArtistsLis.css";

interface Artist {
  id: number;
  name: string;
  image: string;
  scrobbles: number;
  rank: number;
}

const TopArtistsLis: React.FC = () => {
  // Local state for the time filter
  const [timeFilter_artists, setTimeFilter_artists] = useState("Last 7 days");

  // Sử dụng useNavigate để điều hướng
  const navigate = useNavigate();

  // Sample data for the artists
  const artists_artists: Artist[] = [
    {
      id: 1,
      name: "k.d. lang",
      image: "/placeholder.svg?height=60&width=60",
      scrobbles: 299,
      rank: 1,
    },
    {
      id: 2,
      name: "Carly Rae Jepsen",
      image: "/placeholder.svg?height=60&width=60",
      scrobbles: 228,
      rank: 2,
    },
    {
      id: 3,
      name: "Liz Phair",
      image: "/placeholder.svg?height=60&width=60",
      scrobbles: 156,
      rank: 3,
    },
    {
      id: 4,
      name: "Fletcher",
      image: "/placeholder.svg?height=60&width=60",
      scrobbles: 138,
      rank: 4,
    },
  ];

  // Stats data
  const stats_artists = {
    plays: 1,
    likes: 0,
    comments: 1,
    reposts: 0,
    downloads: 0,
  };

  // Hàm xử lý sự kiện nhấn nút quay lại
  const handleBackButtonClick = () => {
    navigate("/listening");  // Điều hướng trở lại trang /listening
  };

  return (
    <div className="listening-container_artists">
      <h1 className="listening-title_artists">Listening</h1>

      <div className="top-section_artists">
        <button className="back-button_artists" onClick={handleBackButtonClick}>
          <span>&#8249;</span>  {/* Nút quay lại */}
        </button>
        <h2 className="section-title_artists">Top Artists</h2>
        <div className="filter-dropdown_artists">
          <span>{timeFilter_artists}</span>
          <span className="dropdown-arrow_artists">&#9662;</span>
        </div>
      </div>

      <div className="stats-bar_artists">
        <div className="stat-item_artists play-stat_artists">
          <span className="play-icon_artists">▶</span>
          <span>{stats_artists.plays} play</span>
        </div>
        <div className="stat-item_artists">
          <span className="heart-icon_artists">♡</span>
          <span>{stats_artists.likes} likes</span>
        </div>
        <div className="stat-item_artists">
          <span className="comment-icon_artists">💬</span>
          <span>{stats_artists.comments} comment</span>
        </div>
        <div className="stat-item_artists">
          <span className="repost-icon_artists">↺</span>
          <span>{stats_artists.reposts} reposts</span>
        </div>
        <div className="stat-item_artists">
          <span className="download-icon_artists">↓</span>
          <span>{stats_artists.downloads} downloads</span>
        </div>
      </div>

      <div className="artists-list_artists">
        {artists_artists.map((artist) => (
          <div key={artist.id} className="artist-item_artists">
            <div className="artist-rank_artists">{artist.rank}</div>
            <div className="artist-image_artists">
              <img src={artist.image || "/placeholder.svg"} alt={artist.name} />
            </div>
            <div className="artist-info_artists">
              <div className="artist-name_artists">{artist.name}</div>
              <div className="scrobbles-count_artists">
                {artist.scrobbles} {artist.rank === 1 ? "scrobbles" : ""} <span className="arrow-icon_artists">›</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopArtistsLis;
