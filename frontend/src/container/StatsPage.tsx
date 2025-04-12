import React from "react";
import StatsLayouts from "../layouts/StatsLayouts";
import ContentStats from "../components/ContentStats";

const StatsPage: React.FC = () => {
  return (
    <StatsLayouts>
      <ContentStats />
    </StatsLayouts>
  );
};

export default StatsPage;
