// src/components/nav_admin.tsx
import type React from "react"
import { NavLink } from "react-router-dom"
import "../styles/admin.css"

const Nav_admin: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav_item_admin active_admin" : "nav_item_admin"

  return (
    <nav className="nav_admin">
      <ul className="nav_list_admin">
        <li>
          <NavLink to="/admin" end className={linkClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="6" y1="20" x2="6" y2="14"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="18" y1="20" x2="18" y2="10"></line>
            </svg>

            <span>Statistical</span>
          </NavLink>  
        </li>
        <li>
          <NavLink to="/admin/lis_tracks" end className={linkClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Song list</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/tracks" end className={linkClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            <span>Song waiting for approval</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/users" end className={linkClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>User management</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Nav_admin
