
import { Routes, Route } from "react-router-dom";
import StatsPage from "../container/StatsPage";

const StatsLayouts = () => {
  return (
    <div className="stats-layouts">
      <Routes>
        <Route path="/" element={<StatsPage />} /> {/* Route con cho /listening */}
      </Routes>
    </div>
  );
};

export default StatsLayouts;

