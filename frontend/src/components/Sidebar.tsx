import '../styles/Sidebar.css';

import stackIcon from '../assets/stack.png';
import musicNoteIcon from '../assets/notnhac.png';

const Sidebar = () => (
  <aside className="sidebar">
    <button className="btn-YL"><img src={stackIcon} alt="Library" /></button>
    <button className="btn-NN"><img src={musicNoteIcon} alt="Music" /></button>
  </aside>
);

export default Sidebar;
