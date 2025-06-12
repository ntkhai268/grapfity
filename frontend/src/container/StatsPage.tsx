import NavStats from "../components/NavStats";
import ContentStats from "../components/ContentStats";
import "../styles/StatsLayout.css";

const StatsPage = () => {
  return (
    <div className="stats-layout">
      <NavStats />
      <div className="stats-content">
        < ContentStats/>
      </div>
    </div>
  );
};

export default StatsPage;
