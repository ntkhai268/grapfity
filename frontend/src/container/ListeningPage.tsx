import NavStats from "../components/NavStats";
import Recent from "../components/Listening";
import TopStats from "../components/TopListening";

const ListeningPage = () => {
  return (
    <div className="listening-page">
      <NavStats />
      <div className="content">
        <Recent />
      </div>
      <div className="top-stats-container">
        <TopStats />
      </div>
    </div>
  );
};

export default ListeningPage;
