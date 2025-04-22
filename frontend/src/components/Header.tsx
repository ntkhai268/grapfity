
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/Header.css';

import spotifyLogo from '../assets/images/spotify.png';
import homeIcon from '../assets/images/home.png';
import bellIcon from '../assets/images/bell.png';
import userIcon from '../assets/images/iconnguoidung.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const toggleUserMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header>
      <h1><img src={spotifyLogo} alt="Spotify" /></h1>

      <button className="btn-MP" onClick={() => navigate("/mainpage")}>
        <img src={homeIcon} alt="Trang chủ" />
      </button>

      <div className="search-bar">
        <FontAwesomeIcon icon={faSearch} />
        <input type="text" placeholder="What do you want to play?" />
        <div className="divider"></div>
        <FontAwesomeIcon icon={faTrash} />
      </div>

      <button className="btn-TB"><img src={bellIcon} alt="Thông báo" /></button>

      <div className="user-dropdown" ref={dropdownRef}>
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
            <div className="menu-item" onClick={() => console.log("Logging out...")}>
              Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
