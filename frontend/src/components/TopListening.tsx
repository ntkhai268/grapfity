import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/TopUpload.css";

import {
  fetchListeningHistory,
  ListeningHistoryRecord,
} from "../services/listeningService";

const API_BASE_URL = 'http://localhost:8080';
// --- IMPORT ĐỘNG ẢNH TỪ /src/assets/images ---
// const imageModules = import.meta.glob(
//   "../assets/images/*.{jpg,jpeg,png,svg}",
//   { eager: true, as: "url" }
// ) as Record<string, string>;

// const imageMap: Record<string, string> = {};
// Object.entries(imageModules).forEach(([fullPath, url]) => {
//   const filename = fullPath.split("/").pop()!;
//   imageMap[filename] = url;
// });

interface StatsItem {
  id: number | string;
  title: string | null;
  plays: number;
  coverUrl?: string;
}

function getInitials(name?: string | null): string {
  if (!name || name.trim() === "") return "??";
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const TopListening: React.FC = () => {
  const [topTracks, setTopTracks] = useState<StatsItem[]>([]);
  const [topListeners, setTopListeners] = useState<StatsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const history = await fetchListeningHistory();

        const trackMap = new Map<number, { record: ListeningHistoryRecord; count: number }>();
        history.forEach(item => {
          const id = item.track.id;
          const prev = trackMap.get(id);
          if (prev) prev.count += item.listenCount;
          else trackMap.set(id, { record: item, count: item.listenCount });
        });

        const listenerMap = new Map<string, { sample: ListeningHistoryRecord; count: number }>();
        history.forEach(item => {
          const name = item.track.User.UploaderName ?? "Unknown";
          const prev = listenerMap.get(name);
          if (prev) prev.count += item.listenCount;
          else listenerMap.set(name, { sample: item, count: item.listenCount });
        });

        const tracksArray: StatsItem[] = Array.from(trackMap.entries()).map(
          ([id, { record, count }]) => {
            const fname = record.track.imageUrl?.split("/").pop() ?? "";
             const coverUrl = `${API_BASE_URL}/assets/track_image/${fname}`;
            return {
              id,
              title: record.metadata?.trackname ?? `Track ${id}`,
              plays: count,
              coverUrl,
            };
          }
        );

        const listenersArray: StatsItem[] = Array.from(listenerMap.entries()).map(
          ([name, { count }]) => ({
            id: name,
            title: name,
            plays: count,
          })
        );

        setTopTracks(tracksArray.sort((a, b) => b.plays - a.plays).slice(0, 3));
        setTopListeners(listenersArray.sort((a, b) => b.plays - a.plays).slice(0, 3));
      } catch (err) {
        console.error("Error loading listening history", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const renderSection = (
    heading: string,
    items: StatsItem[],
    mode: "tracks" | "listeners"
  ) => (
    <div className={mode === "tracks" ? "top-tracks-section" : "top-listeners-section"}>
      <div className="section-header">
        <h2>{heading}</h2>
        <Link to={mode === "tracks" ? "/top-tracks" : "/top-artists"} className="see-more">
          See more
        </Link>
      </div>

      <div className={mode === "tracks" ? "tracks-list" : ""}>
        {isLoading ? (
          <div>Đang tải…</div>
        ) : items.length === 0 ? (
          <div>Chưa có dữ liệu.</div>
        ) : (
          items.map(item =>
            mode === "tracks" ? (
              <div key={item.id} className="track-item">
                <div className="track-icon">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.title ?? "track"} className="track-cover" />
                  ) : (
                    <div className="placeholder-cover">No image</div>
                  )}
                </div>
                <div className="track-info">
                  <span className="track-title">{item.title}</span>
                </div>
                <div className="track-time">{item.plays} plays</div>
              </div>
            ) : (
              <div key={item.id} className="listener-profile">
                <div className="listener-avatar">{getInitials(item.title)}</div>
                <div className="listener-info">
                  <div className="listener-name">{item.title}</div>
                  <div className="listener-stats">
                    <span className="play-count">{item.plays} plays</span>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="top-upload-container">
      {renderSection("Top Tracks", topTracks, "tracks")}
      {renderSection("Top Artist", topListeners, "listeners")}
    </div>
  );
};

export default TopListening;
