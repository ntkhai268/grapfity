import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserTracks, TrackWithCount } from '../services/uploadService';
import '../styles/TopTracksLis.css';

// --- IMPORT ĐỘNG ẢNH TỪ /src/assets/images (Vite) ---
const imageModules = import.meta.glob(
  '../assets/images/*.{jpg,jpeg,png,svg}',
  { eager: true, as: 'url' }
) as Record<string, string>;
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split('/').pop()!;
  imageMap[filename] = url;
});

const TopTracksLis: React.FC = () => {
  const [timeFilter] = useState('Last 7 days');
  const [tracks, setTracks] = useState<TrackWithCount[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTracks() {
      try {
        const allTracks = await getUserTracks();
        setTracks(allTracks);
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      }
    }
    loadTracks();
  }, []);

  const totalPlays = tracks.reduce((sum, t) => sum + t.listenCount, 0);

  // Khởi tạo baseURL nếu chưa có
  if (!axios.defaults.baseURL) {
    axios.defaults.baseURL = 'http://localhost:8080';
  }

  // Hàm resolve ảnh: ưu tiên local assets, sau đó remote hoặc public
  const getImageSrc = (url: string) => {
    const filename = url.split('/').pop() || '';
    if (filename && imageMap[filename]) {
      return imageMap[filename];
    }
    if (/^(https?:)?\/\//.test(url)) {
      return url;
    }
    if (url.startsWith('/')) {
      // relative to public folder
      return `${window.location.origin}${url}`;
    }
    // fallback for plain relative
    return `${window.location.origin}/${url}`;
  };

  return (
    <div className="listening-container_tracklis">
      <h1 className="listening-title_tracklis">Top tracks on Graptify</h1>

      <div className="top-section_tracklis">
        <button className="back-button_tracklis" onClick={() => navigate('/upload')}>
          <span>&#8249;</span>
        </button>
        <h2 className="section-title_tracklis">Top tracks</h2>
        <div className="filter-dropdown_tracklis">
          <span>{timeFilter}</span>
          <span className="dropdown-arrow_tracklis">&#9662;</span>
        </div>
      </div>

      <div className="stats-bar_tracklis">
        <div className="stat-item_tracklis play-stat_tracklis">
          <span className="play-icon_tracklis">▶</span>
          <span>{totalPlays} plays</span>
        </div>
      </div>

      <div className="tracks-table_tracklis">
        <div className="table-header_tracklis">
          <div className="header-cell_tracklis time-period_tracklis">{timeFilter}</div>
          <div className="header-cell_tracklis plays-header_tracklis">Plays</div>
        </div>

        <div className="tracks-list_tracklis">
          {tracks.map(track => (
            <div key={track.id} className="track-item_tracklis">
              <div className="track-image_tracklis">
                <img
                  src={getImageSrc(track.imageUrl)}
                  alt={track.title}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                  onError={e => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = imageMap['placeholder.svg'] || `${window.location.origin}/placeholder.svg`;
                  }}
                />
              </div>
              <div className="track-details_tracklis">
                <span className="track-id_tracklis">ID: {track.id}</span>
                <span className="track-name_tracklis">{track.title}</span>
              </div>
              <div className="track-plays_tracklis">
                {track.listenCount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopTracksLis;