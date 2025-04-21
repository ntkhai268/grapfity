// src/container/TopTracksLisPage.tsx
import React from "react";
import SeeMoreLayouts from "../layouts/SeeMoreLayouts";
import TopTracks from "../components/TopTracks";
import NavStats from "../components/NavStats";  // Import NavStats

const TopTracksLisPage: React.FC = () => {
    return (
        <SeeMoreLayouts>
            <NavStats />
            <TopTracks />  {/* Component cho trang TopTracksLisPage */}
        </SeeMoreLayouts>
    );
};

export default TopTracksLisPage;
