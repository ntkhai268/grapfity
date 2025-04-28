import React from "react";

interface TabsProps {}

const Tab: React.FC<TabsProps> = () => {
  return (
    <div className="tabs_profile">
      <span className="tab" data-tab="all">All</span>
      <span className="tab" data-tab="popular">Popular tracks</span>
      <span className="tab" data-tab="track">Tracks</span>
      <span className="tab" data-tab="playlist">Playlist</span>
    </div>
  );
};

export default Tab;