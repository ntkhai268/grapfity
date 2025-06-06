// src/components/TopTracks.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserTracks } from '../services/uploadService';
import '../styles/TopTracksLis.css';

const API_BASE_URL = 'http://localhost:8080';
// load images from assets via Vite
// const imageModules = import.meta.glob(
//   '../assets/images/*.{jpg,jpeg,png,svg}',
//   { eager: true, as: 'url' }
// ) as Record<string, string>;
// const imageMap: Record<string, string> = {};
// Object.entries(imageModules).forEach(([path, url]) => {
//   imageMap[path.split('/').pop()!] = url;
// });

// resolve image src
// function getImageSrc(url: string): string {
//   const filename = url.split('/').pop() || '';
//   if (filename && imageMap[filename]) {
//     return imageMap[filename];
//   }
//   if (/^(https?:)?\/\//.test(url)) {
//     return url;
//   }
//   if (url.startsWith('/')) {
//     return `${window.location.origin}${url}`;
//   }
//   return `${window.location.origin}/${url}`;
// }

// format date dd/mm/yyyy
function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

interface TrackItem {
  id: number;
  title: string;
  artist: string;
  imageUrl: string;
  plays: number;
  listenedAt: string;
}

type FilterOption =
  | 'all'
  | 'last7'
  | 'playsDesc'
  | 'playsAsc'
  | 'titleAsc'
  | 'titleDesc';

const TopTracks: React.FC = () => {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserTracks();
        const list: TrackItem[] = data.map(t => ({
          id: t.id,
          title: t.trackName ?? `Track ${t.id}`,
          artist: t.artist?.UploaderName ?? 'Unknown Artist',
          imageUrl: t.imageUrl,
          plays: t.listenCount,
          listenedAt: t.updatedAt // or createdAt
        }));
        setTracks(list);
      } catch (err) {
        console.error('Failed to fetch tracks:', err);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayed = useMemo(() => {
    let arr = [...tracks];
    const now = Date.now();
    if (filter === 'last7') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      arr = arr.filter(t => new Date(t.listenedAt).getTime() >= weekAgo);
    }
    if (filter === 'playsDesc') arr.sort((a, b) => b.plays - a.plays);
    if (filter === 'playsAsc') arr.sort((a, b) => a.plays - b.plays);
    if (filter === 'titleAsc') arr.sort((a, b) => a.title.localeCompare(b.title));
    if (filter === 'titleDesc') arr.sort((a, b) => b.title.localeCompare(a.title));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      arr = arr.filter(
        t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [tracks, filter, searchTerm]);

  const totalPlays = displayed.reduce((sum, t) => sum + t.plays, 0);

  return (
    <div className="toptracks-page">
      <h1 className="page-title">Top tracks on Graptify</h1>
      <div className="content-wrapper">
        {/* Sidebar */}
        <div className="sidebar_listening">
          <button className="back-button" onClick={() => navigate('/upload')}>{'<'} Back</button>
          <input
            type="text"
            placeholder="Search title "
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
            <option value="playsDesc">Plays: high → low</option>
            <option value="playsAsc">Plays: low → high</option>
            <option value="titleAsc">Title: A → Z</option>
            <option value="titleDesc">Title: Z → A</option>
          </select>
        </div>

        {/* Main content */}
        <div className="main-content">
          <div className="plays-summary">
            <span className="play-icon">▶</span>
            <span>{totalPlays} plays</span>
          </div>

          <div className="tracks-table">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Track</th>
                    <th>Artist</th>
                    <th>Date</th>
                    <th>Played</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(t => (
                    <tr key={t.id}>
                      <td className="cell-track">
                        <div className="track-info">
                          <img
                            src={(`${API_BASE_URL}/assets/track_image/${t.imageUrl}`)}
                            alt={t.title}
                            onError={e => {
                              e.currentTarget.onerror = null;
                               const fallbackImage = `${API_BASE_URL}/assets/track_image/placeholder.svg`; 
                              e.currentTarget.src = fallbackImage;
                            }}
                            className="track-image"
                          />
                          <div className="track-details">
                            <div className="track-title">{t.title}</div>
                          </div>
                        </div>
                      </td>
                      <td>{t.artist}</td>
                      <td>{formatDate(t.listenedAt)}</td>
                      <td className="cell-played">{t.plays}</td>
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

export default TopTracks;
