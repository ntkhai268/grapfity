import React from "react";

const Header = () => {
  return (
    <header>
      <h1>
        <img src="assets/spotify.png" alt="Spotify" />
      </h1>
      <button className="btn-MP">
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z"></path>
        </svg>
      </button>

      <div className="search-bar">
        <i className="fas fa-search"></i>
        <input type="text" placeholder="What do you want to play?" />
        <div className="divider"></div>
        <i className="fas fa-trash"></i>
      </div>
      <button className="btn-TB">
      <svg
          width="30"
          height="30"
          viewBox="0 0 16 16"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
         <path d="M8 0a5.5 5.5 0 0 0-5.5 5.5v3.069L.307 12.376A.75.75 0 0 0 .25 13h15.5a.75.75 0 0 0-.057-.624L13.5 8.567V5.5A5.5 5.5 0 0 0 8 0zm1.937 14.5H6.063a2 2 0 0 0 3.874 0z"></path>
        </svg>
      </button>
      <button className="btn-ND">
        <img src="assets/iconnguoidung.png" alt="Người dùng" />
      </button>
    </header>
  );
};

export default Header;
