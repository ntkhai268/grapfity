import React from "react";
import "../styles/StatsLayout.css";
import NavStats from "../components/NavStats";

const StatsLayouts: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="stats-layout">
      <NavStats />
      <main className="stats-content">{children}</main>
    </div>
  );
};

export default StatsLayouts;
