import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import SearchResult from "../components/SearchResult";
import "../styles/HomeLayout.css"; // Dùng chung layout CSS

const SearchLayout: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    document.body.classList.add("home-page");
    return () => {
      document.body.classList.remove("home-page");
    };
  }, []);

  // Hàm xử lý toggle sidebar
  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  return (
    <div className="main-background">
      <div className="main-layout">
        <Header />
        <div className="main-content">
          {/* Truyền sự kiện toggle từ Sidebar */}
          <Sidebar onExpandChange={handleSidebarToggle} />
          <div className="page-content">
            {/* Chỉ cần truyền sidebarExpanded */}
            <SearchResult sidebarExpanded={sidebarExpanded} />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default SearchLayout;
