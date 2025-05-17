// src/components/Recent_Uploads.tsx
import React, { useState, useEffect } from 'react';
import '../styles/Recent_LnU.css';
import { getUserTracks, MinimalTrack } from '../services/uploadService';

// Import tất cả ảnh từ src/assets/images (Vite)
const imageModules = import.meta.glob(
  '../assets/images/*.{jpg,jpeg,png,svg}',
  { eager: true, as: 'url' }
) as Record<string, string>;
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split('/').pop()!;
  imageMap[filename] = url;
});

const Recent_Uploads: React.FC = () => {
  const [tracks, setTracks] = useState<MinimalTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserTracks();
        // Sort giảm dần theo createdAt và lấy 5 bản mới nhất
        const recent5 = data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setTracks(recent5);
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
            // Lấy filename từ đường dẫn tương đối
            const filename = track.imageUrl.split('/').pop() || '';
            const imgUrl = imageMap[filename] || '';
            return (
              <div key={track.id} className="track_LnU">
                <div className="track_LnU-image">
                  {imgUrl && <img src={imgUrl} alt={`Track ${track.id}`} />}
                </div>
                <div className="track_LnU-info">
                  <span className="track-title">{`Track ${track.id}`}</span>
                  <span className="track-artist">{`Uploader ${track.uploaderId}`}</span>
                  <span className="track-time">{new Date(track.createdAt).toLocaleString()}</span>
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