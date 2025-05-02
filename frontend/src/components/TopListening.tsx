// src/components/TopStats.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/TopListening.css";
import {
  fetchListeningHistory,
  fetchAllTracks,
  HistoryRecord,
  TrackRecord
} from '../services/listeningService';

type Category = "tracks" | "artists";

interface StatsItem {
  id: number;
  name: string;
  streams: number;
  imageUrl: string;
}

// --- IMPORT ĐỘNG ẢNH TỪ /src/assets/images ---
const imageModules = import.meta.glob(
  '../assets/images/*.{jpg,jpeg,png,svg}',
  { eager: true, as: 'url' }
) as Record<string, string>;

const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([fullPath, url]) => {
  const filename = fullPath.split('/').pop()!; 
  imageMap[filename] = url;
});

const TopStats: React.FC = () => {
  const [activeTab, setActiveTab] = useState<{ tracks: string; artists: string }>({
    tracks: "last-12-months",
    artists: "last-12-months",
  });
  const [tracksData, setTracksData] = useState<StatsItem[]>([]);
  const [artistsData, setArtistsData] = useState<StatsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const dateRange = "Mar. 2024 - Mar. 2025";

  const handleTabChange = (category: Category, tab: string) => {
    setActiveTab(prev => ({ ...prev, [category]: tab }));
  };

  useEffect(() => {
    (async () => {
      try {
        const [histories, tracks] = (await Promise.all([
          fetchListeningHistory(),
          fetchAllTracks(),
        ])) as [HistoryRecord[], TrackRecord[]];

        // Đếm tổng streams
        const countMap = new Map<number, number>();
        histories.forEach(h => {
          countMap.set(h.trackId, (countMap.get(h.trackId) || 0) + h.listenCount);
        });

        // Ghép info + resolve ảnh
        const merged: StatsItem[] = tracks.map(t => {
          const fname = t.imageUrl.split('/').pop()!;
          return {
            id: t.id,
            name: (t as any).name ?? `Track ${t.id}`,
            streams: countMap.get(t.id) || 0,
            imageUrl: imageMap[fname] || "", 
          };
        });
        const topThree = merged
          .sort((a, b) => b.streams - a.streams)
          .slice(0, 3);

        setTracksData(topThree);
        setArtistsData(topThree); // tạm dùng tracks cho artists
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderListSection = (title: string, category: Category, data: StatsItem[]) => (
    <div className="stats-section">
      <div className="stats-header_listening">
        <h2>{title}</h2>
        <Link to={`/top-${category}`} className="see-more">See more</Link>
      </div>

      <div className="tabs">
        {["last-month","last-6-months","last-12-months"].map(tab => (
          <button
            key={tab}
            className={activeTab[category] === tab ? "active" : ""}
            onClick={() => handleTabChange(category, tab)}
          >
            {tab === "last-month" ? "Last month"
             : tab === "last-6-months" ? "Last 6 months"
             : "Last 12 months"}
          </button>
        ))}
      </div>

      <div className="date-range">{dateRange}</div>
      <div className="streams-label">Streams</div>

      <ul className="stats-list">
        {loading
          ? <li>Loading...</li>
          : data.map(item => (
              <li key={item.id} className="stats-item">
                <div className="item-info">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="item-thumb"
                  />
                  <span className="item-name">{item.name}</span>
                </div>
                <div className="item-streams">{item.streams}</div>
              </li>
            ))
        }
      </ul>
    </div>
  );

  return (
    <div className="top-stats-container">
      {renderListSection("Top Tracks", "tracks", tracksData)}
      {renderListSection("Top Artists", "artists", artistsData)}
    </div>
  );
};

export default TopStats;
