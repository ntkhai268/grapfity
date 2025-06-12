// src/components/TopUpload.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserTracks, TrackWithCount } from '../services/uploadService';
import '../styles/TopUpload.css';

const API_BASE_URL = 'http://localhost:8080';
// 1. Import tất cả ảnh trong src/assets/images qua Vite
// const imageModules = import.meta.glob('../assets/images/*.{jpg,jpeg,png,svg}', {
//   eager: true,
//   as: 'url'
// }) as Record<string, string>;

// // 2. Build map filename → URL
// const imageMap: Record<string, string> = {};
// Object.entries(imageModules).forEach(([fullPath, url]) => {
//   const filename = fullPath.split('/').pop()!;
//   imageMap[filename] = url;
// });

interface Listener {
  id: number;
  name: string;
  count: number;
}

const TopUpload: React.FC = () => {
  const [tracks, setTracks] = useState<TrackWithCount[]>([]);
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 1. Lấy tất cả tracks kèm theo listenCount và artist (uploader)
        const allTracks = await getUserTracks();

        // 2. Tính top 3 tracks
        const top3Tracks = allTracks
          .slice()
          .sort((a, b) => b.listenCount - a.listenCount)
          .slice(0, 3)
          .map(track => {
            const raw = track.imageUrl.split('/').pop()!;
            const imageUrl = `${API_BASE_URL}/assets/track_image/${raw}`;
            return {
              ...track,
              imageUrl
            };
          });
        setTracks(top3Tracks);

        // 3. Tính tổng plays theo listener (uploader)
        const listenerAgg = new Map<number, { name: string; count: number }>();

        allTracks.forEach(track => {
          const id = track.uploaderId;                         // dùng uploaderId từ TrackWithCount
          const name = track.artist?.UploaderName;             // tên từ artist nếu có
          if (!name) return;

          const prev = listenerAgg.get(id);
          if (prev) {
            listenerAgg.set(id, {
              name: prev.name,
              count: prev.count + track.listenCount
            });
          } else {
            listenerAgg.set(id, {
              name,
              count: track.listenCount
            });
          }
        });

        // 4. Chuyển Map → mảng, sort và lấy top 3 listeners
        const top3Listeners: Listener[] = Array.from(listenerAgg.entries())
          .map(([id, { name, count }]) => ({ id, name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setListeners(top3Listeners);
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
      {/* Top Tracks */}
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

      {/* Top Listeners */}
      <div className="top-listeners-section">
        <div className="section-header">
          <h2>Top listeners</h2>
        </div>
        {loading ? (
          <div>Đang tải listeners…</div>
        ) : listeners.length === 0 ? (
          <div>Chưa có listener nào.</div>
        ) : (
          listeners.map(listener => (
            <div key={listener.id} className="listener-profile">
              <div className="listener-avatar">
                <span className="initial">
                  {listener.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="listener-info">
                <div className="listener-name">{listener.name}</div>
                <div className="listener-stats">
                  <span className="play-count">
                    {listener.count} plays
                  </span>
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