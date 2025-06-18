import  { useEffect, useState } from 'react'; 
import { Routes, Route, Navigate, useParams } from "react-router-dom"; 
import { getCurrentUser } from "./services/authService";

import Homepage from "./container/HomePage";
// import Profile from "./container/ProfilePage";

import HomeLayout from "./layouts/HomeLayouts";
import ProfileLayout from "./layouts/ProfileLayouts";
import ManagerSongLayout from "./layouts/ManagerSongLayout";
import ManagerPlaylistLayout from "./layouts/ManagerPlaylistLayout";

import SeeMoreLayouts from "./layouts/SeeMoreLayouts";
import TopArtistsLisPage from "./container/TopArtistsLisPage";
import TopTracksLisPage from "./container/TopTracksLisPage";
import TopTracksPage from "./container/TopTracksPage";

import UploadLayouts from "./layouts/UploadLayouts";
import StatsLayouts from "./layouts/StatsLayouts";
import ListeningLayouts from "./layouts/ListeningLayouts";

import LoginForm from "./container/Login";
import LoginLayout from "./layouts/LoginLayouts";
import SearchPage from "./container/SearchPage";
import ManagerSongSection from "./components/ManagerSongSection";

// Import GlobalAudioManager và các kiểu dữ liệu/API cần thiết
import GlobalAudioManager, { PlaylistContext, Song } from './hooks/GlobalAudioManager';
// --- SỬA LẠI IMPORT: Sử dụng getTracksInPlaylistAPI ---
// Import hàm getTracksInPlaylistAPI và kiểu PlaylistData (nếu cần)
// Đảm bảo hàm này và kiểu PlaylistData được export từ file service đúng
import { getTracksInPlaylistAPI } from './services/trackPlaylistService';  
import { PlaylistData } from './components/Manager_Playlists/ManagerDataPlaylist';
// ----------------------------------------------------
import { getAllTracksAPI} from './services/trackServiceAPI';
import { getLikedTracksByProfileAPI } from './services/likeService';
import { getMyPlaylistsAPI } from './services/playlistService';



export function useProfileUserId(): string | number | null {
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!profileUserId && !currentUserId) {
      getCurrentUser().then(user => {
        if (user?.id) {
          setCurrentUserId(user.id);
        }
      });
    }
  }, [profileUserId]);

  return profileUserId || currentUserId;
}
// Hàm tiện ích map từ TrackData (hoặc cấu trúc track trong PlaylistData) sang Song
const mapTrackDataToSong = (track: any): Song => ({ 
    id: track.id, 
    src: track.src || track.trackUrl || '', 
    title: track.title === null ? undefined : track.title,
    artist: track.artist === null ? undefined : track.artist,
    cover: track.cover === null ? undefined : track.cover,
});


import AdminLayout from "./layouts/adminlayouts"
import Section_admin from "./components/section_admin"
import Section_admin_tracks from "./components/section_admin_tracks"
import Section_admin_users from "./components/section_admin_users"
import Section_admin_profile from "./components/section_admin_statistical"


const App = () => {
 const viewedUserId = useProfileUserId(); // lấy user trước

  // useEffect(() => {
  //   if (!viewedUserId) return; // chưa có user → không gọi

  //   const fetchPlaylist = async (context: PlaylistContext): Promise<Song[] | null> => {
  //     try {
  //       if (!context?.type || !context?.id) return null;

  //       if (context.type === 'playlist') {
  //         if (typeof context.id === 'string' && context.id.startsWith('playlist_profile_')) {
  //           const rawId = context.id.replace('playlist_profile_', '');
  //           const allPlaylists = await getMyPlaylistsAPI();
  //           const matched = allPlaylists.find(p => String(p.id) === rawId);
  //           if (!matched) return null;
  //           return matched.tracks.map(mapTrackDataToSong);
  //         }

  //         const playlistData: PlaylistData | null = await getTracksInPlaylistAPI(Number(context.id));
  //         return playlistData?.tracks?.map(mapTrackDataToSong) || null;
  //       }

  //       if (context.type === 'profile' && context.id === 'liked') {
  //         const likedTrackData = await getLikedTracksByProfileAPI(viewedUserId);
  //         return likedTrackData.map(mapTrackDataToSong);
  //       }

  //       if (context.type === 'queue') {
  //         const allTrackData = await getAllTracksAPI();
  //         return allTrackData.map(mapTrackDataToSong);
  //       }

  //       if (context.type === 'waveform') {
  //         const rawSongs = localStorage.getItem(waveformPlaylist_${context.id});
  //         if (!rawSongs) return null;
  //         return JSON.parse(rawSongs) as Song[];
  //       }

  //       return null;
  //     } catch {
  //       return null;
  //     }
  //   };
    
  //   GlobalAudioManager.loadInitialState(fetchPlaylist);
  // }, [viewedUserId]); // chỉ gọi khi đã có user

  useEffect(() => {
    console.log("🧪 viewedUserId in App.tsx:", viewedUserId); // ← Thêm dòng này
  if (!viewedUserId) return;

  const fetchPlaylist = async (context: PlaylistContext): Promise<Song[] | null> => {
    try {
      console.log("🔍 fetchPlaylist CALLED with context:", context);

      if (!context?.type || !context?.id) {
        console.warn("❌ Invalid context:", context);
        return null;
      }

      if (context.type === 'playlist') {
        if (typeof context.id === 'string' && context.id.startsWith('playlist_profile_')) {
          const rawId = context.id.replace('playlist_profile_', '');
          const allPlaylists = await getMyPlaylistsAPI();
          const matched = allPlaylists.find(p => String(p.id) === rawId);
          console.log("🎯 Matched profile playlist:", matched);
          if (!matched) return null;
          return matched.tracks.map(mapTrackDataToSong);
        }

        const playlistData: PlaylistData | null = await getTracksInPlaylistAPI(Number(context.id));
        console.log("🎯 Playlist from API:", playlistData);
        return playlistData?.tracks?.map(mapTrackDataToSong) || null;
      }

      if (context.type === 'profile' && context.id === 'liked') {
        const likedTrackData = await getLikedTracksByProfileAPI(viewedUserId);
        console.log("💖 Liked tracks:", likedTrackData);
        return likedTrackData.map(mapTrackDataToSong);
      }

      if (context.type === 'queue') {
        const allTrackData = await getAllTracksAPI();
        console.log("📦 All tracks (queue):", allTrackData);
        return allTrackData.map(mapTrackDataToSong);
      }

      if (context.type === 'waveform') {
        const rawSongs = localStorage.getItem(`waveformPlaylist_${context.id}`);
        console.log("📊 Waveform rawSongs:", rawSongs);
        if (!rawSongs) return null;
        return JSON.parse(rawSongs) as Song[];
      }
      if (context.type === 'search') {
        const raw = localStorage.getItem("currentContext");
        if (raw) {
            const parsed = JSON.parse(raw);
            console.log("🔎 Đang phục hồi playlist từ search:", parsed);
            return parsed.songs || null;
        }
}

      return null;
    } catch (e) {
      console.error("❌ Error in fetchPlaylist:", e);
      return null;
    }
  };

  const init = async () => {
    console.log("🟡 INIT audio manager...");

    await GlobalAudioManager.loadInitialState(fetchPlaylist);

    const current = GlobalAudioManager.getCurrentSong?.(); // nếu có getter
    console.log("🎧 Current song after init:", current);

    if (!current) {
      console.log("⚠️ No current song — trying to restore from localStorage");
      // gọi nếu bạn đã định nghĩa
    } else {
      console.log("✅ Already has a song — no need to restore");
    }
  };

  init();
}, [viewedUserId]);


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
      <Route path="/ManagerSong" element={<ManagerSongLayout />}>
        <Route index element={<div style={{ color: "white", padding: 32 }}>Chọn một bài hát để quản lý.</div>} />
        <Route path=":trackId" element={<ManagerSongSection />} />
      </Route>
      <Route path="/ManagerPlaylistLayout/:playlistId" element={<ManagerPlaylistLayout />} />
      <Route path="/stats/*" element={<StatsLayouts />} />
      <Route path="/upload/*" element={<UploadLayouts />} />
      <Route path="/listening/*" element={<ListeningLayouts />} />
      <Route path="/top-artists" element={<SeeMoreLayouts><TopArtistsLisPage /></SeeMoreLayouts>} />
      <Route path="/top-tracks" element={<SeeMoreLayouts><TopTracksLisPage /></SeeMoreLayouts>} />
      {/* <Route path="/top-genres" element={<SeeMoreLayouts><TopGenresLisPage /></SeeMoreLayouts>} /> */}
      <Route path="/top-tracks-page" element={<SeeMoreLayouts><TopTracksPage /></SeeMoreLayouts>} />
      <Route path="/search" element={<SearchPage />} />

      {/* Trang upload với Upload Layout */}
      <Route path="/upload/*" element={<UploadLayouts />} />

      {/* Trang listening với Listening Layout */}
      <Route path="/listening/*" element={<ListeningLayouts />} />
      {/* Các route bọc trong SeeMoreLayouts để sử dụng chung Nav */}
      <Route path="/top-artists" element={<SeeMoreLayouts><TopArtistsLisPage /></SeeMoreLayouts>} />
      <Route path="/top-tracks" element={<SeeMoreLayouts><TopTracksLisPage /></SeeMoreLayouts>} />
      <Route path="/top-tracks-page" element={<SeeMoreLayouts><TopTracksPage /></SeeMoreLayouts>} />
      <Route path="/search" element={<SearchPage />} />

      <Route
        path="/admin"
        element={
          <AdminLayout>
            <Section_admin_profile />              {/* Trang mặc định */}
          </AdminLayout>
        }
      /> 
      <Route
        path="/admin/lis_tracks"
        element={
          <AdminLayout>
            <Section_admin />              {/* Trang mặc định */}
          </AdminLayout>
        }
      />
      <Route
        path="/admin/tracks"
        element={
          <AdminLayout>
            <Section_admin_tracks />       {/* Trang Bài hát chờ duyệt */}
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <Section_admin_users />        {/* Trang Quản lý người dùng */}
          </AdminLayout>
        }
      />

    </Routes>
  );
};

export default App;
