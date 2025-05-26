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

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<JoinedTrack[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const toggleUserMenu = () => setShowMenu((prev) => !prev);
  const toggleUploadModal = () => setShowUploadModal((prev) => !prev);

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

      <button className="btn-upload" onClick={toggleUploadModal}>
        Upload
      </button>
      <button className="btn-TB">
        <img src={bellIcon} alt="Thông báo" />
      </button>

      <div className="user-dropdown">
        <button className="btn-ND" onClick={toggleUserMenu}>
          <img src={userIcon} alt="Người dùng" />
        </button>
        {showMenu && (
          <div className="dropdown-menu">
            <div className="menu-item" onClick={() => navigate("/profile")}>
              Profile
            </div>
            <div className="menu-item" onClick={() => navigate("/stats")}>
              Stats
            </div>
            <div
              className="menu-item"
              onClick={() => console.log("Logging out...")}
            >
              Logout
            </div>
          </div>
        )}
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
