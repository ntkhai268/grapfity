// src/components/TopUpload.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TopUpload.css';

// 1. Import tất cả ảnh trong src/assets/images qua Vite
const imageModules = import.meta.glob('../assets/images/*.{jpg,jpeg,png,svg}', {
  eager: true,
  as: 'url'
}) as Record<string, string>;

// 2. Build map filename → URL
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([fullPath, url]) => {
  const filename = fullPath.split('/').pop()!; // ex: "bacphan.jpg"
  imageMap[filename] = url;
});

interface MinimalTrack {
  id: number;
  title: string;
  imageUrl: string;   // ex "/assets/images/bacphan.jpg" hoặc "bacphan.jpg"
  listenCount: number;
}

const TopUpload: React.FC = () => {
  const [tracks, setTracks] = useState<MinimalTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // state cho time tabs
  const [activeTimeTab, setActiveTimeTab] = useState<
    'lastMonth' | 'last6months' | 'last12months'
  >('last12months');

  const handleTimeTabClick = (tab: 'lastMonth' | 'last6months' | 'last12months') => {
    setActiveTimeTab(tab);
    // TODO: nếu cần lọc lại tracks theo khoảng thời gian, xử lý ở đây
  };

  useEffect(() => {
    (async () => {
      try {
        // 3. Fetch listening histories và tất cả tracks của user
        const [histRes, tracksRes] = await Promise.all([
          axios.get<{ histories: { trackId: number; listenCount: number }[] }>(
            'http://localhost:8080/api/listening-histories',
            { withCredentials: true }
          ),
          axios.get<{ data: { id: number; title?: string; imageUrl: string }[] }>(
            'http://localhost:8080/api/tracks/user',
            { withCredentials: true }
          )
        ]);

        // 4. Build map trackId → tổng listenCount
        const countMap = histRes.data.histories.reduce<Record<number, number>>((acc, h) => {
          acc[h.trackId] = (acc[h.trackId] || 0) + h.listenCount;
          return acc;
        }, {});

        // 5. Merge, sort giảm dần và slice top 3
        const merged: MinimalTrack[] = tracksRes.data.data
          .map(t => {
            const raw = t.imageUrl.split('/').pop()!;
            return {
              id: t.id,
              title: t.title || `Track ${t.id}`,
              imageUrl: imageMap[raw] || '',
              listenCount: countMap[t.id] || 0
            };
          })
          .sort((a, b) => b.listenCount - a.listenCount)
          .slice(0, 3);

        setTracks(merged);
      } catch (err) {
        console.error('Lỗi fetch TopUpload:', err);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="top-upload-container">
      <div className="top-tracks-section">
        <div className="section-header">
          <h2>Top tracks on Graptify</h2>
          <Link to="/top-tracks-page" className="see-more">See more</Link>
        </div>

        {/* Thêm time tabs */}
        <div className="time-tabs">
          <button
            className={activeTimeTab === 'lastMonth' ? 'active' : ''}
            onClick={() => handleTimeTabClick('lastMonth')}
          >
            Last month
          </button>
          <button
            className={activeTimeTab === 'last6months' ? 'active' : ''}
            onClick={() => handleTimeTabClick('last6months')}
          >
            Last 6 months
          </button>
          <button
            className={activeTimeTab === 'last12months' ? 'active' : ''}
            onClick={() => handleTimeTabClick('last12months')}
          >
            Last 12 months
          </button>
        </div>

        {/* Thêm date range & header cho cột Streams */}
        <div className="section-header">
          <div className="date-range">Mar. 2024 - Mar. 2025</div>
          <div className="track-streams">Streams</div>
        </div>

        <div className="tracks-list">
          {loading ? (
            <div>Đang tải top uploads…</div>
          ) : tracks.length === 0 ? (
            <div>Chưa có dữ liệu.</div>
          ) : (
            tracks.map(track => (
              <div key={track.id} className="track-item">
                <div className="track-icon">
                  {track.imageUrl
                    ? <img src={track.imageUrl} alt={track.title} className="track-cover" />
                    : <div className="placeholder-cover">No image</div>
                  }
                </div>
                <div className="track-info">
                  <span className="track-title">{track.title}</span>
                </div>
                <div className="track-time">{track.listenCount} plays</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="top-listeners-section">
        <h2>Top listeners</h2>
        <div className="listener-tabs">
          <button className="active">Last 7 days</button>
        </div>
        <div className="listener-profile">
          <img src="/placeholder.svg" alt="Listener avatar" className="listener-avatar" />
          <div className="listener-info">
            <div className="listener-name">Phạm Huy</div>
            <div className="listener-stats">
              <span className="play-count">1 play</span>
              <span className="followers-count">0 followers</span>
            </div>
          </div>
        </div>
        <div className="pro-message">
          Meet the rest of your listeners with Artist Pro
        </div>
      </div>
    </div>
  );
};

export default TopUpload;
