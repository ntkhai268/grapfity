// src/container/TopGenresLisPage.tsx
import React from "react";
import SeeMoreLayouts from "../layouts/SeeMoreLayouts";
import TopGenresLis from "../components/TopGenresLis";
import NavStats from "../components/NavStats";  // Import NavStats

const TopGenresLisPage: React.FC = () => {
    return (
        <SeeMoreLayouts>
            <NavStats />
            <TopGenresLis />  {/* Component cho trang TopGenresLisPage */}
        </SeeMoreLayouts>
    );
};

export default TopGenresLisPage;
