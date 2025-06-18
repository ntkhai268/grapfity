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
import { getCurrentUser } from "../services/authService";
import { getMyProfile, UserType as UserData } from "../services/userService.ts";

// Map ảnh
const imageModules = import.meta.glob("../assets/images/*.{png,jpg,jpeg,svg}", {
  eager: true,
  as: "url",
});
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split("/").pop();
  if (filename) imageMap[filename] = url as string;
});

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

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Lỗi logout:", err);
    }
    localStorage.removeItem("roleId");
    localStorage.removeItem("userId");
    window.location.href = "/login";
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
        const matched = allTracks.filter((t) => {
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getMyProfile();
        setUser(profile);
      } catch (err) {
        console.error("Lỗi lấy thông tin người dùng:", err);
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
      setIsLoggedIn(!!user);
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
          🔍
        </button>

        {/* Dropdown */}
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
                    localStorage.setItem(
                      "selectedTrack",
                      JSON.stringify(track)
                    );
                    navigate("/search");
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={track.Metadatum?.trackname || `Track ${track.id}`}
                  />
                  <div>
                    <div className="dropdown-title">
                      {track.Metadatum?.trackname}
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
        <button className="btn-upload" onClick={toggleUploadModal}>
          Upload
        </button>
        <button className="btn-TB">
          <img src={bellIcon} alt="Thông báo" />
        </button>

        <div className="user-dropdown">
          {isLoggedIn ? (
            <button className="btn-ND" onClick={toggleUserMenu}>
              <img src={user?.Avatar || userIcon} alt="Người dùng" />
            </button>
          ) : (
            <button className="Login" onClick={() => navigate("/login")}>
              Đăng Nhập
            </button>
          )}
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
