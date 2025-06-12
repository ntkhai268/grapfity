import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom"; // 👈 Thêm Link từ react-router-dom
import "../styles/NavStats.css";

const NavStats = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // 👈 Hook để điều hướng

  const toggleDropdown = () => {
    setOpenDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="nav-stats">
      <div className="nav-group-left">
      <Link to="/stats" className="nav-left"> {/* Thay đổi đây */}
          <img
            src="https://img.icons8.com/color/48/combo-chart--v1.png"
            alt="Logo"
            width="24"
            height="24"
          />
          Stats for Graptify
        </Link>

        <div className="nav-center">
          <Link to="/listening">Listening</Link> {/* Thay đổi đây */}
          <Link to="/upload">Upload</Link> {/* Thay đổi đây */}
        </div>
      </div>

      <div className="nav-right">
        <div
          className="account-dropdown"
          onClick={toggleDropdown}
          ref={dropdownRef}
        >
          Account ▾
          {openDropdown && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => navigate("/profile")} // 👈 Điều hướng tới /profile
              >
                Profile
              </div>
              <div className="dropdown-item">Settings</div>
              <div className="dropdown-item">Logout</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavStats;
