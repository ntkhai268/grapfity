// src/layouts/UploadLayouts.tsx

import { Routes, Route } from "react-router-dom";
import UploadPage from "../container/UploadPage";

const UploadLayouts = () => {
  return (
    <div className="upload-layouts">
      <Routes>
        <Route path="/" element={<UploadPage />} /> {/* Route for /upload */}
      </Routes>
    </div>
  );
};

export default UploadLayouts;
