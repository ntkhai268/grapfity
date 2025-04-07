import '/Users/dangkhoii/Documents/Graptify/frontend/src/styles/Header.css'; // ✅ thêm dòng này

import spotifyLogo from '../assets/spotify.png';
import homeIcon from '../assets/home.png';
import bellIcon from '../assets/bell.png';
import userIcon from '../assets/iconnguoidung.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';

const Header = () => (
  <header>
    <h1><img src={spotifyLogo} alt="Spotify" /></h1>
    <button className="btn-MP"><img src={homeIcon} alt="Trang chủ" /></button>
    <div className="search-bar">
      <FontAwesomeIcon icon={faSearch} />
      <input type="text" placeholder="What do you want to play?" />
      <div className="divider"></div>
      <FontAwesomeIcon icon={faTrash} />
    </div>
    <button className="btn-TB"><img src={bellIcon} alt="Thông báo" /></button>
    <button className="btn-ND"><img src={userIcon} alt="Người dùng" /></button>
  </header>
);

export default Header;
