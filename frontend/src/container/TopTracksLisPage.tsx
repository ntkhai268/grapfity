// src/container/TopTracksLisPage.tsx
import React from "react";
import SeeMoreLayouts from "../layouts/SeeMoreLayouts";
import TopTracksLis from "../components/TopTracksLis";
import NavStats from "../components/NavStats";  // Import NavStats

const TopTracksLisPage: React.FC = () => {
    return (
        <SeeMoreLayouts>
            <NavStats />
            <TopTracksLis />  {/* Component cho trang TopTracksLisPage */}
        </SeeMoreLayouts>
    );
};

export default TopTracksLisPage;
