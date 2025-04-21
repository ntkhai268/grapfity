// src/container/TopArtistsLisPage.tsx
import React from "react";
import SeeMoreLayouts from "../layouts/SeeMoreLayouts";  // Import Layout
import TopArtistsLis from "../components/TopArtitsLis";  // Import component cho nội dung trang
import NavStats from "../components/NavStats";  // Import NavStats

const TopArtistsLisPage: React.FC = () => {
    return (
        <SeeMoreLayouts>
            <NavStats />
            <TopArtistsLis />  {/* Không cần gọi NavStats ở đây */}
        </SeeMoreLayouts>
    );
};

export default TopArtistsLisPage;
