// src/components/TopArtistsLis.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchListeningHistory, ListeningHistoryRecord } from '../services/listeningService';
import '../styles/TopArtistsLis.css';

interface ArtistItem {
  name: string;
  scrobbles: number;
  lastListened: string;
}

type FilterOption = 'all' | 'last7' | 'scrobblesDesc' | 'scrobblesAsc' | 'nameAsc' | 'nameDesc';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const TopArtistsLis: React.FC = () => {
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const histories = await fetchListeningHistory();
        const map = new Map<string, { rec: ListeningHistoryRecord; count: number }>();
        histories.forEach(h => {
          const artistName = h.track.User?.UploaderName ?? 'Unknown Artist';
          const prev = map.get(artistName);
          if (prev) {
            prev.count += h.listenCount;
            if (new Date(h.createdAt) > new Date(prev.rec.createdAt)) {
              prev.rec = h;
            }
          } else {
            map.set(artistName, { rec: h, count: h.listenCount });
          }
        });
        const list = Array.from(map.values()).map(({ rec, count }) => ({
          name: rec.track.User?.UploaderName ?? 'Unknown Artist',
          scrobbles: count,
          lastListened: rec.createdAt,
        }));
        setArtists(list);
      } catch (err) {
        console.error(err);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayed = useMemo(() => {
    let arr = [...artists];
    const now = Date.now();
    if (filter === 'last7') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      arr = arr.filter(a => new Date(a.lastListened).getTime() >= weekAgo);
    }
    if (filter === 'scrobblesDesc') arr.sort((a, b) => b.scrobbles - a.scrobbles);
    if (filter === 'scrobblesAsc') arr.sort((a, b) => a.scrobbles - b.scrobbles);
    if (filter === 'nameAsc') arr.sort((a, b) => a.name.localeCompare(b.name));
    if (filter === 'nameDesc') arr.sort((a, b) => b.name.localeCompare(a.name));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      arr = arr.filter(a => a.name.toLowerCase().includes(q));
    }
    return arr;
  }, [artists, filter, searchTerm]);

  const totalScrobbles = displayed.reduce((sum, a) => sum + a.scrobbles, 0);

  return (
    <div className="listening-page">
      <h1 className="page-title">Listening</h1>
      <div className="content-wrapper">

        {/* Sidebar */}
        <div className="sidebar_listening">
          <button className="back-button" onClick={() => navigate('/listening')}>
            ‹ Top artists
          </button>

          <input
            type="text"
            placeholder="Search artist..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value as FilterOption)}
            className="select-filter"
          >
            <option value="all">All</option>
            <option value="last7">Last 7 days</option>
            <option value="scrobblesDesc">Scrobbles: high → low</option>
            <option value="scrobblesAsc">Scrobbles: low → high</option>
            <option value="nameAsc">Name: A → Z</option>
            <option value="nameDesc">Name: Z → A</option>
          </select>
        </div>

        {/* Main content */}
        <div className="main-content">
          <div className="plays-summary">
            <span className="play-icon">▶</span>
            <span>{totalScrobbles} scrobbles</span>
          </div>

          <div className="tracks-table">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Artist</th>
                    <th>Date</th>
                    <th>Scrobbles</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((a, idx) => (
                    <tr key={a.name}>
                      <td>{idx + 1}</td>
                      <td className="cell-track">
                        <div className="track-info">
                          <div className="avatar-letter">
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="track-title">{a.name}</span>
                        </div>
                      </td>
                      <td>{formatDate(a.lastListened)}</td>
                      <td className="cell-played">{a.scrobbles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TopArtistsLis;
