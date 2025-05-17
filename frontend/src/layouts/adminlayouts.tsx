// src/layouts/adminlayouts.tsx  
import type React from "react"
import type { ReactNode } from "react"
import Header_admin from "../components/header_admin"
import Nav_admin from "../components/nav_admin"
import "../styles/admin.css"

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="admin_page_container">
      <Header_admin />                              {/* từ turn0file0 */}
      <div className="admin_main_content">
        <Nav_admin />                               {/* từ turn0file1 */}
        <main className="admin_section_wrapper">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout                              