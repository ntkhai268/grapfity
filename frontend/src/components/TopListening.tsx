// src/components/TopStats.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/TopListening.css";
import {
  fetchListeningHistory,
  ListeningHistoryRecord,
} from "../services/listeningService";

// --- IMPORT ĐỘNG ẢNH TỪ /src/assets/images ---
const imageModules = import.meta.glob(
  "../assets/images/*.{jpg,jpeg,png,svg}",
  { eager: true, as: "url" }
) as Record<string, string>;

const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([fullPath, url]) => {
  const filename = fullPath.split("/").pop()!;
  imageMap[filename] = url;
});

type Category = "tracks" | "artists";

interface StatsItem {
  id: number | string;      // với artists dùng string key (tên artist)
  name: string;
  streams: number;
  imageUrl?: string;        // optional cho track hoặc artist
}

// Lấy chữ cái đầu hoặc hai chữ cái đầu làm avatar
function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const TopStats: React.FC = () => {
  const [tracksData, setTracksData] = useState<StatsItem[]>([]);
  const [artistsData, setArtistsData] = useState<StatsItem[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    (async () => {
      try {
        const histories = await fetchListeningHistory();

        // 1. Tính tổng streams theo track
        const trackCounts = new Map<number, { record: ListeningHistoryRecord; count: number }>();
        histories.forEach(h => {
          const tid = h.track.id;
          const prev = trackCounts.get(tid);
          if (prev) prev.count += h.listenCount;
          else trackCounts.set(tid, { record: h, count: h.listenCount });
        });

        // 2. Tính tổng streams theo artist (UploaderName)
        const artistCounts = new Map<string, { sample: ListeningHistoryRecord; count: number }>();
        histories.forEach(h => {
          const name = h.track.User.UploaderName;
          const prev = artistCounts.get(name);
          if (prev) prev.count += h.listenCount;
          else artistCounts.set(name, { sample: h, count: h.listenCount });
        });

        // 3. Chuẩn bị mảng StatsItem cho tracks
        const tracksList: StatsItem[] = Array.from(trackCounts.entries()).map(
          ([id, { record, count }]) => {
            const fname = record.track.imageUrl.split("/").pop()!;
            return {
              id,
              name: record.metadata?.trackname ?? `Track ${id}`,
              streams: count,
              imageUrl: imageMap[fname] || record.track.imageUrl,
            };
          }
        );

        // 4. Chuẩn bị mảng StatsItem cho artists
        const artistsList: StatsItem[] = Array.from(artistCounts.entries()).map(
          ([name, { sample, count }]) => ({
            id: name,
            name,
            streams: count,
            imageUrl: undefined, // để tạo avatar chữ cái
          })
        );

        // Lấy top 3
        const topTracks = tracksList.sort((a, b) => b.streams - a.streams).slice(0, 3);
        const topArtists = artistsList.sort((a, b) => b.streams - a.streams).slice(0, 3);

        setTracksData(topTracks);
        setArtistsData(topArtists);
      } catch (err) {
        console.error("Error loading listening history", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderListSection = (
    title: string,
    category: Category,
    data: StatsItem[]
  ) => (
    <div className="stats-section">
      <div className="stats-header_listening">
        <h2>{title}</h2>
        <Link to={`/top-${category}`} className="see-more">
          See more
        </Link>
      </div>

      <div className="date-range">{category === 'tracks' ? 'Tracks' : 'Artists'}</div>
      <div className="streams-label">Played</div>

      <ul className="stats-list">
        {loading ? (
          <li>Loading...</li>
        ) : (
          data.map(item => (
            <li key={item.id} className="stats-item">
              <div className="item-info">
                {category === 'artists' ? (
                  <div className="item-avatar">
                    {getInitials(item.name)}
                  </div>
                ) : (
                  item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="item-thumb"
                    />
                  )
                )}
                <span className="item-name">{item.name}</span>
              </div>
              <div className="item-streams">{item.streams}</div>
            </li>
          ))
        )}
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
