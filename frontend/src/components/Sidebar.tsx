// components/Sidebar.tsx
import React, {  useEffect, useState  } from "react";

import "../styles/Section.css"; // đổi sang Sidebar.css
import stackIcon from "../assets/images/stack.png";
import musicNoteIcon from "../assets/images/notnhac.png";
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from "../services/authService";

import { createPlaylistAPI,getMyPlaylistsAPI  } from "../services/playlistService";
import {  mockArtists } from "../services/mockSidebar";

interface PlaylistData {
    id: number;
    title: string;
    artist: string;
    timeAgo: string;
    cover: string | null; // Cho phép cover là null
    imageUrl?: string | null;
}

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onExpandChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"playlists" | "artists">("playlists");
  const [myPlaylists, setMyPlaylists] = useState<PlaylistData[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

   useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const playlists = await getMyPlaylistsAPI();
        setMyPlaylists(playlists);
      } catch (error) {
        console.error("Không thể tải danh sách playlist:", error);
      }
    };
    fetchPlaylists();
  }, []);
  useEffect(() => {
      const checkLogin = async () => {
        const user = await getCurrentUser();
        setIsLoggedIn(!!user); // true nếu có user, false nếu null
      };
  
      checkLogin();
    }, []);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
  
      if (!isLoggedIn) {
        // Hiển thị alert, sau khi nhấn OK thì chuyển đến login
        alert('Vui lòng đăng nhập để thêm bài hát vào playlist!');
        navigate('/login', { state: { from: location.pathname } });
      }
  
      // nếu đã đăng nhập thì mở dropdown playlist ở đây
    };

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    onExpandChange?.(next);
  };

  const handleCreatePlaylist = async () => {
    console.log("Bắt đầu tạo playlist mới...");
    // Có thể thêm trạng thái loading ở đây nếu muốn (ví dụ: disable nút)
    // setIsLoading(true);
    try {
        // Gọi API tạo playlist mới (KHÔNG cần truyền userId, chỉ truyền trackId nếu có)
        // Vì đây là tạo playlist trống, không cần truyền gì cả (hoặc truyền null/undefined)
        const newPlaylist = await createPlaylistAPI(); // <-- Gọi không cần tham số

        if (newPlaylist && newPlaylist.id) {
            console.log("Playlist mới đã được tạo:", newPlaylist);
            // Điều hướng đến trang của playlist mới tạo thành công
            navigate(`/ManagerPlaylistLayout/${newPlaylist.id}`);
        } else {
            console.error("Không thể tạo playlist: API không trả về dữ liệu hợp lệ.");
            alert("Đã xảy ra lỗi khi tạo playlist (phản hồi không hợp lệ).");
        }
    } catch (error: any) { // Bắt lỗi cụ thể hơn
        console.error("Lỗi khi tạo playlist:", error);
        // Kiểm tra lỗi Unauthorized
        if (error.message === 'Unauthorized') {
             alert("Vui lòng đăng nhập để tạo playlist.");
        } else {
             alert(`Đã xảy ra lỗi khi tạo playlist: ${error.message || 'Vui lòng thử lại.'}`);
        }
    } finally {
        // Tắt trạng thái loading nếu có
        // setIsLoading(false);
    }
};

  return (
    <aside className={`sidebar${expanded ? " expanded" : ""}`}>
      {/* Toggle và các nút cố định */}
      <button className="btn-YL" onClick={handleToggle}>
        <div className="btn-icon">
          <img src={stackIcon} alt="Library" />
        </div>
        {expanded && <span className="btn-label">Your Library</span>}
      </button>

      <button className="btn-NN">
        <div className="btn-icon">
          <img src={musicNoteIcon} alt="Music" />
        </div>
        {expanded && <span className="btn-label">Music</span>}
      </button>
      { isLoggedIn ?(
        <button className="btn-CrePlaylist" onClick={handleCreatePlaylist}>
          <div className="btn-icon">
            <svg viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/>
            </svg>
          </div>
          {expanded && <span className="btn-label">Create Playlist</span>}
        </button>
        ):(
          
           <button className="btn-CrePlaylist" style={{ color: '#888', cursor: 'not-allowed' }} onClick={handleClick}>
              <div className="btn-icon">
                <svg viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/>
                </svg>
              </div>
              {expanded && <span className="btn-label">Create Playlist</span>}
            </button>
          
        )
      }
      {/* Tabs chỉ hiển thị khi expanded */}
      {expanded && (
        <div className="sidebar-tabs">
          <button
            className={activeTab === "playlists" ? "active" : ""}
            onClick={() => setActiveTab("playlists")}
          >
            Playlists
          </button>
          <button
            className={activeTab === "artists" ? "active" : ""}
            onClick={() => setActiveTab("artists")}
          >
            Artists
          </button>
        </div>
      )}

      {/* Danh sách luôn render */}
      <ul className="sidebar-list">
         {activeTab === "playlists" &&
          myPlaylists.map((pl) => (
            <li
              key={pl.id}
              className="sidebar-item"
              onClick={() => navigate(`/ManagerPlaylistLayout/${pl.id}`)}
              style={{ cursor: "pointer", color: "#1db954" }}
              title={`Go to playlist: ${pl.title}`}
            >
              {pl.cover?.trim() ? (
                <img
                  src={pl.cover}
                  alt={pl.title}
                  className="playlist-cover"
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                  className="playlist-cover"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z" />
                </svg>
              )}
              <div className="item-texts">
                <p className="item-title">{pl.title}</p>
                <p className="item-sub">{pl.artist}</p>
              </div>
            </li>
          ))}

        {activeTab === "artists" &&
          mockArtists.map((ar) => (
            <li
              key={ar.id}
              className="sidebar-item"
              onClick={() => navigate(`/profile`)}
            >
              <img
                src={ar.imageUrl}
                alt={ar.name}
                className="artist-avatar"
              />
              <div className="item-texts">
                <p className="item-title">{ar.name}</p>
                <p className="item-sub">Artist</p>
              </div>
            </li>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;