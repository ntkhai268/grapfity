import { Link } from "react-router-dom"; // 👈 Thêm Link từ react-router-dom
import "../styles/ContentStats.css";

const ContentStats = () => {
  return (
    <div className="content-stats">
      <div className="stats-header">
        <h1>Stats for Graptify</h1>
        <p>Choose what you want to see:</p>
        <div className="stats-buttons">
          <Link to="/listening">
            <button>Listening</button> {/* Thêm điều hướng cho Listening */}
          </Link>
          <Link to="/upload">
            <button>Upload</button> {/* Thêm điều hướng cho Upload */}
          </Link>
        </div>
      </div>

      <div className="stats-info">
        <div className="info-block">
          <img src="https://img.icons8.com/ios/100/headphones.png" alt="Listening" />
          <div>
            <h3>Listening</h3>
            <p>
              View your most listened tracks, artists and genres and switch
              between 3 different time periods. Your data is updated approximately every day.
            </p>
          </div>
        </div>
        <div className="info-block">
          <img src="https://img.icons8.com/ios/100/upload.png" alt="Upload" />
          <div>
            <h3>Upload</h3>
            <p>Upload music and see views.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStats;
