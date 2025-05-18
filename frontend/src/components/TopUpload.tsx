// src/components/TopUpload.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getUserTracks, TrackWithCount } from '../services/uploadService';
import '../styles/TopUpload.css';

// 1. Import tất cả ảnh trong src/assets/images qua Vite
const imageModules = import.meta.glob('../assets/images/*.{jpg,jpeg,png,svg}', {
  eager: true,
  as: 'url'
}) as Record<string, string>;

// 2. Build map filename → URL
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([fullPath, url]) => {
  const filename = fullPath.split('/').pop()!;
  imageMap[filename] = url;
});

interface Listener {
  id: number;
  Name: string;
  count: number;
}

const TopUpload: React.FC = () => {
  const [tracks, setTracks] = useState<TrackWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [listeners, setListeners] = useState<Listener[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // 1. Fetch track data
        const allTracks = await getUserTracks();
        // lấy top 3 tracks
        const top3 = allTracks
          .slice()
          .sort((a, b) => b.listenCount - a.listenCount)
          .slice(0, 3)
          .map(track => {
            const raw = track.imageUrl.split('/').pop()!;
            return { ...track, imageUrl: imageMap[raw] || '' };
          });
        setTracks(top3);

        // 2. Fetch raw listening histories
        const histRes = await axios.get<{ histories: Array<{ trackId: number; listenCount: number; listener: { id: number; Name: string } }> }>('/api/listening-histories', { withCredentials: true });
        const agg: Record<number, { Name: string; count: number }> = {};
        histRes.data.histories.forEach(h => {
          if (agg[h.listener.id]) {
            agg[h.listener.id].count += h.listenCount;
          } else {
            agg[h.listener.id] = { Name: h.listener.Name, count: h.listenCount };
          }
        });
        // sort và lấy top 3 listeners
        const topL = Object.entries(agg)
          .map(([id, data]) => ({ id: Number(id), Name: data.Name, count: data.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        setListeners(topL);
      } catch (err) {
        console.error('Lỗi fetch TopUpload:', err);
        setTracks([]);
        setListeners([]);
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
          <Link to="/top-tracks-page" className="see-more">
            See more
          </Link>
        </div>
        <div className="section-header">
          <div className="date-range">Tracks</div>
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
                  {track.imageUrl ? (
                    <img
                      src={track.imageUrl}
                      alt={track.trackName || `Track ${track.id}`}
                      className="track-cover"
                    />
                  ) : (
                    <div className="placeholder-cover">No image</div>
                  )}
                </div>
                <div className="track-info">
                  <span className="track-title">
                    {track.trackName || `Track ${track.id}`}
                  </span>
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
         
        </div>
        {loading ? (
          <div>Đang tải listeners…</div>
        ) : listeners.length === 0 ? (
          <div>Chưa có listener nào.</div>
        ) : (
          listeners.map(listener => (
            <div key={listener.id} className="listener-profile">
              <div className="listener-avatar">
                {/* dùng chữ cái đầu làm avatar */}
                <span className="initial">{listener.Name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="listener-info">
                <div className="listener-name">{listener.Name}</div>
                <div className="listener-stats">
                  <span className="play-count">{listener.count} plays</span>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="pro-message">
          Meet the rest of your listeners with Artist Pro
        </div>
      </div>
    </div>
  );
};

export default TopUpload;