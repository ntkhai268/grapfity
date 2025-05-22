import  { useEffect } from 'react'; 
import { Routes, Route, Navigate } from "react-router-dom"; 

import Homepage from "./container/HomePage";
// import Profile from "./container/ProfilePage";

import HomeLayout from "./layouts/HomeLayouts";
import ProfileLayout from "./layouts/ProfileLayouts";
import ManagerSongLayout from "./layouts/ManagerSongLayout";
import ManagerPlaylistLayout from "./layouts/ManagerPlaylistLayout";

import SeeMoreLayouts from "./layouts/SeeMoreLayouts";
import TopArtistsLisPage from "./container/TopArtistsLisPage";
import TopTracksLisPage from "./container/TopTracksLisPage";
import TopGenresLisPage from "./container/TopGenresLisPage";
import TopTracksPage from "./container/TopTracksPage";

import UploadLayouts from "./layouts/UploadLayouts";
import StatsLayouts from "./layouts/StatsLayouts";
import ListeningLayouts from "./layouts/ListeningLayouts";

import LoginForm from "./container/Login";
import LoginLayout from "./layouts/LoginLayouts";
import SearchPage from "./container/SearchPage";

// Import GlobalAudioManager và các kiểu dữ liệu/API cần thiết
import GlobalAudioManager, { PlaylistContext, Song } from './hooks/GlobalAudioManager';
// --- SỬA LẠI IMPORT: Sử dụng getTracksInPlaylistAPI ---
// Import hàm getTracksInPlaylistAPI và kiểu PlaylistData (nếu cần)
// Đảm bảo hàm này và kiểu PlaylistData được export từ file service đúng
import { getTracksInPlaylistAPI } from './services/trackPlaylistService';  
import { PlaylistData } from './components/Manager_Playlists/ManagerDataPlaylist';
// ----------------------------------------------------
import { getAllTracksAPI} from './services/trackServiceAPI';
import { getLikedTracksByUserAPI } from './services/likeService';
import { getMyPlaylistsAPI } from './services/playlistService';

// Hàm tiện ích map từ TrackData (hoặc cấu trúc track trong PlaylistData) sang Song
const mapTrackDataToSong = (track: any): Song => ({ 
    id: track.id, 
    src: track.src || track.trackUrl || '', 
    title: track.title === null ? undefined : track.title,
    artist: track.artist === null ? undefined : track.artist,
    cover: track.cover === null ? undefined : track.cover,
});


const App = () => {

 useEffect(() => {
  const fetchPlaylist = async (context: PlaylistContext): Promise<Song[] | null> => {
    try {
      if (!context?.type || !context?.id) return null;

      // if (( context.type === 'album')) {
      //   const playlistData: PlaylistData | null = await getTracksInPlaylistAPI(context.id);
      //   return playlistData?.tracks?.map(mapTrackDataToSong) || null;
      // }
      if (context.type === 'playlist') {
        // ⏹ Trường hợp: playlist từ profile cá nhân
        if (typeof context.id === 'string' && context.id.startsWith('playlist_profile_')) {
          const rawId = context.id.replace('playlist_profile_', '');
          const allPlaylists = await getMyPlaylistsAPI();
          const matched = allPlaylists.find(p => String(p.id) === rawId);
          if (!matched) return null;
          return matched.tracks.map(track => ({
            id: track.id,
            src: track.src,
            title: track.title,
            artist: track.artist,
            cover: track.cover || "/assets/anhmau.png"
          }));
        }

        // ⏹ Trường hợp: phát từ playlist detail hoặc public
        const playlistData: PlaylistData | null = await getTracksInPlaylistAPI(Number(context.id));
        return playlistData?.tracks?.map(track => ({
          id: track.id,
          src: track.src,
          title: track.title,
          artist: track.artist,
          cover: track.cover || "/assets/anhmau.png"
        })) || null;
      }


      if (context.type === 'profile' && context.id === 'liked') {
        const likedTrackData = await getLikedTracksByUserAPI();
        return likedTrackData.map(mapTrackDataToSong);
      }

      if (context.type === 'queue') {
        const allTrackData = await getAllTracksAPI();
        return allTrackData.map(mapTrackDataToSong);
      }

    if (context.type === 'waveform') {
      const rawSongs = localStorage.getItem(`waveformPlaylist_${context.id}`);
      if (!rawSongs) return null;
      return JSON.parse(rawSongs) as Song[];
    }
      return null; // Không hỗ trợ context này
    } catch {
      return null;
    }
  };

  GlobalAudioManager.loadInitialState(fetchPlaylist);
}, []);


  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <LoginLayout>
            <LoginForm />
          </LoginLayout>
        }
      />
      <Route
        path="/mainpage"
        element={
          <HomeLayout>
            <Homepage />
          </HomeLayout>
        }
      />
      <Route path="/profile" element={<ProfileLayout />} />
      <Route path="/profile/:userId" element={<ProfileLayout />} />
      <Route path="/ManagerSong" element={<ManagerSongLayout />} />
      <Route path="/ManagerPlaylistLayout/:playlistId" element={<ManagerPlaylistLayout />} />
      <Route path="/stats/*" element={<StatsLayouts />} />
      <Route path="/upload/*" element={<UploadLayouts />} />
      <Route path="/listening/*" element={<ListeningLayouts />} />
      <Route path="/top-artists" element={<SeeMoreLayouts><TopArtistsLisPage /></SeeMoreLayouts>} />
      <Route path="/top-tracks" element={<SeeMoreLayouts><TopTracksLisPage /></SeeMoreLayouts>} />
      <Route path="/top-genres" element={<SeeMoreLayouts><TopGenresLisPage /></SeeMoreLayouts>} />
      <Route path="/top-tracks-page" element={<SeeMoreLayouts><TopTracksPage /></SeeMoreLayouts>} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
};

export default App;
