// src/components/TopTracksLis.tsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  fetchAllTracks,
  fetchListeningHistory,
} from '../services/listeningService';
import '../styles/TopTracksLis.css';

// --- IMPORT ĐỘNG ẢNH TỪ /src/assets/images ---
const imageModules = import.meta.glob(
  '../assets/images/*.{jpg,jpeg,png,svg}',
  { eager: true, as: 'url' },
) as Record<string, string>;
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([fullPath, url]) => {
  const filename = fullPath.split('/').pop()!;
  imageMap[filename] = url;
});

interface Track {
  id: number;
  image: string;
  plays: number;
}

const TopTracksLis: React.FC = () => {
  const [timeFilter] = useState('Last 7 days');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const storedId = localStorage.getItem('userId');
  const currentUserId = storedId ? parseInt(storedId, 10) : undefined;

  useEffect(() => {
    const loadData = async () => {
      try {
        const allTracks = await fetchAllTracks();
        const histories = await fetchListeningHistory();

        const listenedIds = histories.map(h => h.trackId);
        const userTracks = allTracks.filter(t => listenedIds.includes(t.id));

        const combined: Track[] = userTracks.map(t => {
          const listenCount = histories.find(h => h.trackId === t.id)?.listenCount ?? 0;
          const rawPath = t.imageUrl || 'placeholder.svg';
          const filename = rawPath.split('/').pop()!;
          const localUrl = imageMap[filename];
          const imageUrl = localUrl
            ? localUrl
            : rawPath.startsWith('http')
            ? rawPath
            : `${axios.defaults.baseURL}${rawPath}`;

          return {
            id: t.id,
            image: imageUrl,
            plays: listenCount,
          };
        });

        setTracks(combined);
      } catch (err) {
        console.error('Error loading user-specific tracks', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUserId]);

  const totalPlays = tracks.reduce((sum, t) => sum + t.plays, 0);

  return (
    <div className="listening-container_tracklis">
      <h1 className="listening-title_tracklis">Listening</h1>

      <div className="top-section_tracklis">
        <button
          className="back-button_tracklis"
          onClick={() => navigate('/listening')}
        >
          <span>&#8249;</span>
        </button>
        <h2 className="section-title_tracklis">Top tracks</h2>
        <div className="filter-dropdown_tracklis">
          <span>{timeFilter}</span>
          <span className="dropdown-arrow_tracklis">&#9662;</span>
        </div>
      </div>

      <div className="stats-bar_tracklis">
        <div className="stat-item_tracklis play-stat_tracklis">
          <span className="play-icon_tracklis">▶</span>
          <span>{totalPlays} plays</span>
        </div>
      </div>

      <div className="tracks-table_tracklis">
        <div className="table-header_tracklis">
          <div className="header-cell_tracklis track-header_tracklis">Track</div>
          <div className="header-cell_tracklis plays-header_tracklis">Plays</div>
        </div>

        <div className="tracks-list_tracklis">
          {loading ? (
            <p>Loading...</p>
          ) : (
            tracks.map(track => (
              <div key={track.id} className="track-item_tracklis">
                <div className="track-info_tracklis">
                  <div className="track-image_tracklis">
                    <img
                      src={track.image}
                      alt={`Track ID: ${track.id}`}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          imageMap['placeholder.svg'] || '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="track-details_tracklis">
                    <div className="track-id_tracklis">ID: {track.id}</div>
                  </div>
                </div>
                <div className="track-plays_tracklis">{track.plays}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TopTracksLis;