// import React, { useEffect, useState } from 'react';
// import { apiService } from '../services/apiService';

// interface Song {
//   id: string;
//   title: string;
//   artist: string;
//   image: string;
//   audio: string;
// }

// const SongList: React.FC = () => {
//   const [songs, setSongs] = useState<Song[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchSongs = async () => {
//       try {
//         const data = await apiService.getSongs();
//         setSongs(data);
//       } catch (err) {
//         setError('Không thể tải danh sách bài hát');
//         console.error('Error fetching songs:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSongs();
//   }, []);

//   if (loading) return <div>Đang tải...</div>;
//   if (error) return <div>Lỗi: {error}</div>;

//   return (
//     <div className="song-list">
//       {songs.map((song) => (
//         <div key={song.id} className="song-item">
//           <img src={song.image} alt={song.title} />
//           <div className="song-info">
//             <h3>{song.title}</h3>
//             <p>{song.artist}</p>
//           </div>
//           <audio controls src={song.audio} />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SongList; 