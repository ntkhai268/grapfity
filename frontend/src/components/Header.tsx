// components/Header.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import UploadSongMetadata from "../components/Manager_Songs/UploadSong_Metadata";
import spotifyLogo from "../../public/assets/iconspotify.png";
import homeIcon from "../../public/assets/home.png";
import bellIcon from "../../public/assets/bell.png";
import userIcon from "../../public/assets/iconnguoidung.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { fetchJoinedTracks, JoinedTrack } from "../services/trackService";

// Ánh xạ toàn bộ ảnh từ /assets/images
const imageModules = import.meta.glob(
  "../assets/images/*.{png,jpg,jpeg,svg}",
  { eager: true, as: "url" }
);
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split("/").pop();
  if (filename) imageMap[filename] = url as string;
});
import { getCurrentUser } from "../services/authService";
import { getMyProfile, UserType as UserData  } from "../services/userService.ts";

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<JoinedTrack[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [user, setUser] = useState<UserData | null>(null);

  const toggleUserMenu = () => setShowMenu((prev) => !prev);
  const toggleUploadModal = () => setShowUploadModal((prev) => !prev);

  // Xử lý tìm kiếm
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/logout", {
        method: "POST",
        credentials: "include", // GỬI cookie để backend xoá nó
      });
    } catch (err) {
      console.error("Lỗi khi gọi logout:", err);
    }

    // Xoá dữ liệu phụ nếu bạn lưu gì thêm
    localStorage.removeItem("roleId");
    localStorage.removeItem("userId");
    // hoặc clear hết nếu không có gì quan trọng:
    // localStorage.clear();

    window.location.href = "/mainpage"; 
  };

  const handleSearch = () => {
    const q = searchValue.trim();
    if (q) {
      navigate(`/search?query=${encodeURIComponent(q)}`);
    }
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      const q = searchValue.trim().toLowerCase();
      if (!q) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      try {
        const allTracks = await fetchJoinedTracks();
        const approved = allTracks.filter((t) => t.status === "approved");
        const matched = approved.filter((t) => {
          const name = t.Metadatum?.trackname?.toLowerCase() || "";
          const artist = t.User?.UploaderName?.toLowerCase() || "";
          return name.includes(q) || artist.includes(q);
        });
        setSuggestions(matched.slice(0, 5));
        setShowDropdown(true);
      } catch (err) {
        console.error("Lỗi fetch track:", err);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchValue]);

  // dùng để lấy avatar
  useEffect(() => {
      const fetchUser = async () => {
        try {
          const profile = await getMyProfile();
          setUser(profile);
        } catch (err) {
          console.error("Không thể tải thông tin người dùng:", err);
        }
      };
      fetchUser();
    }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
   
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

   useEffect(() => {
      const checkLogin = async () => {
        const user = await getCurrentUser();
        setIsLoggedIn(!!user); // true nếu có user, false nếu null
      };
  
      checkLogin();
    }, []);

  return (
    <header>
      <h1>
        <img src={spotifyLogo} alt="Spotify" />
      </h1>

      <button className="btn-MP" onClick={() => navigate("/mainpage")}>
        <img src={homeIcon} alt="Trang chủ" />
      </button>

      {/* Search Bar */}
      <div className="search-bar" ref={dropdownRef}>
        <FontAwesomeIcon icon={faSearch} />
        <input
          type="text"
          placeholder="What do you want to play?"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        {searchValue && (
          <button className="clear-btn" onClick={() => setSearchValue("")}>
            ✕
          </button>
        )}
        <div className="vertical-divider"></div>
        <button className="search-icon-btn" onClick={handleSearch}>
          {/* có thể dùng SVG hoặc icon tuỳ ý */}
          🔍
        </button>

        {/* Dropdown Search Results */}
        {showDropdown && suggestions.length > 0 && (
          <div className="search-dropdown">
            {suggestions.map((track) => {
              const fileName = track.imageUrl.split("/").pop()!;
              const imgSrc = imageMap[fileName] || track.imageUrl;

              return (
                <div
                  key={track.id}
                  className="search-dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/search", { state: { selectedTrack: track } });
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={track.Metadatum?.trackname || `Track ${track.id}`}
                  />
                  <div>
                    <div className="dropdown-title">
                      {track.Metadatum?.trackname || `Track ${track.id}`}
                    </div>
                    <div className="dropdown-artist">
                      {track.User?.UploaderName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      
        <div className="right-controls">
          {/* Upload Button */}
          <button className="btn-upload" onClick={toggleUploadModal}>
            Upload
          </button>

          {/* Notification */}
          <button className="btn-TB">
            <img src={bellIcon} alt="Thông báo" />
          </button>

      

          {/* User Dropdown */}
          <div className="user-dropdown" ref={dropdownRef}>
            { isLoggedIn ? (
              <button className="btn-ND" onClick={toggleUserMenu}>
                <img src={user?.Avatar || userIcon} alt="Người dùng" />
              </button>
              ) :(
              <button className="Login" onClick={() => navigate("/login")}>
                  Đăng Nhập
              </button>
              )
            }
            
            {showMenu && (
              <div className="dropdown-menu">
                <div className="menu-item" onClick={() => navigate("/profile")}>
                  Profile
                </div>
                <div className="menu-item" onClick={() => navigate("/stats")}>
                  Stats
                </div>
                {isLoggedIn && (
                  <div className="menu-item" onClick={handleLogout}>
                    Logout
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="popup-backdrop" onClick={toggleUploadModal}>
          <div onClick={(e) => e.stopPropagation()} className="popup-content">
            <UploadSongMetadata onCancel={toggleUploadModal} />
            <button className="popup-close-btn" onClick={toggleUploadModal}>
              &times;
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
