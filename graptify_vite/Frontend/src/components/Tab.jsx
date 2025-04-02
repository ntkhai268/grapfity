import React from "react";

const Tabs = () => {
  return (
    <div className="tabs">
      <span className="tab" data-tab="all">All</span>
      <span className="tab" data-tab="popular">Popular tracks</span>
      <span className="tab" data-tab="track">Tracks</span>
      <span className="tab" data-tab="playlist">Playlist</span>
    </div>
  );
};

export default Tabs;
