import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Recent_LnU.css";

// Cấu hình Axios
axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;

interface HistoryRecord { id: number; userId: number; trackId: number; listenCount: number; createdAt: string; }
interface TrackRecord { id: number; trackUrl: string; imageUrl: string; uploaderId: number; }
interface ListeningItem { id: number; title: string; artist: string; imageUrl: string; trackUrl: string; listenCount: number; timestamp: string; }

// Đọc tất cả ảnh trong src/assets/images qua Vite import
const imageModules = import.meta.glob(
  "../assets/images/*.{jpg,jpeg,png,svg}",
  { eager: true, as: "url" }
) as Record<string, string>;
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const parts = path.split("/");
  const filename = parts[parts.length - 1];
  imageMap[filename] = url;
});

const Recent_LnU: React.FC = () => {
  const [items, setItems] = useState<ListeningItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, tracksRes] = await Promise.all([
          axios.get<{ histories: HistoryRecord[] }>("/api/listening-history"),
          axios.get<{ data: TrackRecord[] }>("/api/tracks"),
        ]);
        const histories = histRes.data.histories;
        const tracks = tracksRes.data.data;

        const merged = histories.map(h => {
          const t = tracks.find(track => track.id === h.trackId);
          // Lấy filename từ imageUrl trả về (ví dụ "bacphan.jpg")
          const filename = t?.imageUrl.split("/").pop() || "";
          return {
            id: h.id,
            title: t ? `Track ${t.id}` : "Unknown",
            artist: t ? `Uploader ${t.uploaderId}` : "Unknown",
            imageUrl: imageMap[filename] || "", // URL do Vite cung cấp
            trackUrl: t?.trackUrl || "",
            listenCount: h.listenCount,
            timestamp: h.createdAt,
          };
        });

        setItems(merged);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
