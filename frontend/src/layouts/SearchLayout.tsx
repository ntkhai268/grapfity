// layouts/SearchLayout.tsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import SearchResult from "../components/SearchResult";
import "../styles/HomeLayout.css";

const SearchLayout: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    document.body.classList.add("home-page");
    return () => {
      document.body.classList.remove("home-page");
    };
  }, []);

  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  return (
    <div className="main-background">
      <div className="main-layout">
        <Header />
        <div className="main-content">
          <Sidebar onExpandChange={handleSidebarToggle} />
          <div className="page-content">
            <SearchResult sidebarExpanded={sidebarExpanded} />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default SearchLayout;