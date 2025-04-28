
import { Routes, Route } from "react-router-dom";
import ListeningPage from "../container/ListeningPage";

const ListeningLayouts = () => {
  return (
    <div className="listening-layouts">
      <Routes>
        <Route path="/" element={<ListeningPage />} /> {/* Route con cho /listening */}
      </Routes>
    </div>
  );
};

export default ListeningLayouts;
