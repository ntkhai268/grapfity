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
import { getCurrentUser } from "../services/authService";
import { getMyProfile, UserData } from "../services/userService";

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMenu(false);
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
      <div className="search-bar">
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
          {/* SVG icon */}
          <svg
            data-encore-id="icon"
            role="img"
            aria-hidden="true"
            className="e-9812-icon e-9812-baseline"
            viewBox="0 0 24 24"
          >
            <path d="M4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4H4V2zM1.513 9.37A1 1 0 0 1 2.291 9H21.71a1 1 0 0 1 .978 1.208l-2.17 10.208A2 2 0 0 1 18.562 22H5.438a2 2 0 0 1-1.956-1.584l-2.17-10.208a1 1 0 0 1 .201-.837zM12 17.834c1.933 0 3.5-1.044 3.5-2.333 0-1.289-1.567-2.333-3.5-2.333S8.5 14.21 8.5 15.5c0 1.289 1.567 2.333 3.5 2.333z" />
          </svg>
        </button>
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
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
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