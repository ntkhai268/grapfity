// src/components/Recent_LnU.tsx
import React, { useState, useEffect } from 'react';
import '../styles/Recent_LnU.css';
import {
  fetchListeningHistory,
  ListeningHistoryRecord,
} from '../services/listeningService';

// Nếu bạn vẫn dùng ảnh local từ assets, giữ lại phần import động
const API_BASE_URL = 'http://localhost:8080';
// const imageModules = import.meta.glob(
//   '../assets/images/*.{jpg,jpeg,png,svg}',
//   { eager: true, as: 'url' }
// ) as Record<string, string>;
// const imageMap: Record<string, string> = {};
// Object.entries(imageModules).forEach(([path, url]) => {
//   const filename = path.split('/').pop()!;
//   imageMap[filename] = url;
// });

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
        const histories: ListeningHistoryRecord[] = await fetchListeningHistory();

        const mapped: ListeningItem[] = histories.map(h => {
          const { track, metadata, listenCount, createdAt } = h;
          const filename = track.imageUrl.split('/').pop() || '';
          const imageUrl = `${API_BASE_URL}/assets/track_image/${filename}`; 
          return {
            id: track.id,
            title: metadata?.trackname ?? `Track ${track.id}`,
            artist: track.User?.UploaderName ?? 'Unknown',
            imageUrl,
            trackUrl: track.trackUrl,
            listenCount,
            timestamp: createdAt,
          };
        });

        const topFive = mapped
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setItems(topFive);
      } catch (error) {
        console.error('Error fetching listening history:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="Recent_LnU">Đang tải lịch sử nghe...</div>;
  }

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
                
                
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recent_LnU;
