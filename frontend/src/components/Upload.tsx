// src/components/Recent_Uploads.tsx
import React, { useState, useEffect } from 'react';
import '../styles/Recent_LnU.css';
import { getUserTracks, TrackWithCount } from '../services/uploadService';
const API_BASE_URL = 'http://localhost:8080';
// Import tất cả ảnh từ src/assets/images (Vite)
// const imageModules = import.meta.glob(
//   '../assets/images/*.{jpg,jpeg,png,svg}',
//   { eager: true, as: 'url' }
// ) as Record<string, string>;
// const imageMap: Record<string, string> = {};
// Object.entries(imageModules).forEach(([path, url]) => {
//   const filename = path.split('/').pop()!;
//   imageMap[filename] = url;
// });

const Recent_Uploads: React.FC = () => {
  const [tracks, setTracks] = useState<TrackWithCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const allTracks = await getUserTracks();

        // Sort giảm dần theo createdAt và lấy 5 bản gần nhất
        const recent = allTracks
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        console.log('[Recent_Uploads] recent tracks:', recent);
        setTracks(recent);
      } catch (e) {
        console.error('Fetch uploads error:', e);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="Recent_LnU">Đang tải uploads...</div>;

  return (
    <div className="Recent_LnU">
      <h1>Uploads</h1>
      <h2>Recent Releases</h2>
      <div className="Recent_LnU-tracks">
        {tracks.length === 0 ? (
          <p>Không có bài hát nào.</p>
        ) : (
          tracks.map(track => {
            const filename = track.imageUrl.split('/').pop() || '';
            const imgUrl = `${API_BASE_URL}/assets/track_image/${filename}` || '';
            return (
              <div key={track.id} className="track_LnU">
                <div className="track_LnU-image">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={track.trackName || `Track ${track.id}`}
                      className="track-cover"
                    />
                  ) : (
                    <div className="placeholder-cover">No image</div>
                  )}
                </div>
                <div className="track_LnU-info">
                  <span className="track-title">
                    {track.trackName || `Track ${track.id}`}
                  </span>
                  {/* Hiển thị tên nghệ sĩ với tiền tố */}
                  <span className="track-artist">
                     {track.artist?.UploaderName ?? `Uploader ${track.uploaderId}`}
                  </span>
                  
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Recent_Uploads;
