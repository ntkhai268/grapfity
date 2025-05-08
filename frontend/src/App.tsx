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
      console.log("[App Init] Attempting to fetch playlist for saved context:", context);
      try {
        let fetchedSongs: Song[] = [];
        // --- SỬA LẠI: Dùng getTracksInPlaylistAPI ---
        if ((context.type === 'playlist' || context.type === 'album') && context.id) {
          // Gọi hàm getTracksInPlaylistAPI để lấy chi tiết playlist
          const playlistData: PlaylistData | null = await getTracksInPlaylistAPI(context.id); 
          // Ánh xạ từ tracks trong playlistData (nếu tồn tại) sang Song[]
          // Đảm bảo mapApiDataToPlaylistData trong service đã xử lý đúng để playlistData có tracks
          fetchedSongs = playlistData?.tracks?.map(mapTrackDataToSong) || []; 
          console.log(`[App Init] Fetched ${fetchedSongs.length} songs using getTracksInPlaylistAPI for ID: ${context.id}`);
        // ---------------------------------------------
        } else if (context.type === 'waveform' || context.type === 'queue') {
          console.log(`[App Init] Fetching all tracks for context type: ${context.type}, ID: ${context.id}`);
          const allTrackData = await getAllTracksAPI(); 
          fetchedSongs = allTrackData.map(mapTrackDataToSong);
          console.log(`[App Init] Fetched ${fetchedSongs.length} total songs for ${context.type}`);
        } else {
            console.warn(`[App Init] Unhandled context type or missing ID:`, context);
        }

        return fetchedSongs.length > 0 ? fetchedSongs : null; 
      } catch (error) {
        console.error("[App Init] Error fetching playlist for initial state:", error);
        return null; 
      }
    };

    console.log("[App Init] Calling GlobalAudioManager.loadInitialState...");
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
