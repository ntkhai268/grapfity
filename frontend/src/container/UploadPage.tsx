// src/container/UploadPage.tsx
import NavStats from "../components/NavStats";
import Upload from "../components/Upload"; // Assuming Upload is a component for the upload section
import TopStats from "../components/TopUpload"; // You can change this to another component if needed

const UploadPage = () => {
  return (
    <div className="upload-page">
      <NavStats />
      <div className="content">
        <Upload /> {/* Component responsible for handling the upload process */}
      </div>
      <div className="top-stats-container">
        <TopStats />
      </div>
    </div>
  );
};

export default UploadPage;
