// src/components/Recent_LnU.tsx
import React, { useState, useEffect } from 'react';
import '../styles/Recent_LnU.css';
import {
  fetchListeningHistory,
  fetchAllTracks,
  HistoryRecord,
  TrackRecord
} from '../services/listeningService';

// Import động ảnh từ thư mục assets/images (Vite)
const imageModules = import.meta.glob(
  '../assets/images/*.{jpg,jpeg,png,svg}',
  { eager: true, as: 'url' }
) as Record<string, string>;
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split('/').pop()!;
  imageMap[filename] = url;
});

interface ListeningItem {
  id: number;
  title: string;
  artist: string;
  imageUrl: string;
  trackUrl: string;
  listenCount: number;
  timestamp: string;
}

const Recent_LnU: React.FC = () => {
  const [items, setItems] = useState<ListeningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Gọi đồng thời hai service
        const [histories, tracks] = await Promise.all([
          fetchListeningHistory(),
          fetchAllTracks(),
        ]);

        // Ghép lịch sử nghe với thông tin track
        const merged: ListeningItem[] = histories.map((h: HistoryRecord) => {
          const t = tracks.find((tr: TrackRecord) => tr.id === h.trackId);
          const filename = t?.imageUrl.split('/').pop() || '';
          return {
            id: h.id,
            title: t ? `Track ${t.id}` : 'Unknown',
            artist: t ? `Uploader ${t.uploaderId}` : 'Unknown',
            imageUrl: imageMap[filename] || '',
            trackUrl: t?.trackUrl || '',
            listenCount: h.listenCount,
            timestamp: h.createdAt,
          };
        });

        // Sắp xếp theo timestamp giảm dần và chỉ lấy 5 mục gần nhất
        const topFive = merged
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setItems(topFive);
      } catch (e) {
        console.error('Fetch error', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="Recent_LnU">Đang tải lịch sử nghe...</div>;

  return (
    <div className="Recent_LnU">
      <h1>Listening</h1>
      <h2>Recently Played</h2>
      <div className="Recent_LnU-tracks">
        {items.length === 0 ? (
          <p>Chưa có lịch sử nghe.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="track_LnU">
              <div className="track_LnU-image">
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
              </div>
              <div className="track_LnU-info">
                <span className="track-title">{item.title}</span>
                <span className="track-artist">{item.artist}</span>
                <span className="track-count">Plays: {item.listenCount}</span>
                <span className="track-time">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recent_LnU;
