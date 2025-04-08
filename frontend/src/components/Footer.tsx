
import '/Users/dangkhoii/Documents/Graptify/frontend/src/styles/Footer.css';

import sampleImage from '../assets/anhmau.png';
import plusIcon from '../assets/plus.png';
import shuffleIcon from '../assets/shuffle.png';
import prevIcon from '../assets/prev.png';
import playIcon from '../assets/play.png';
import nextIcon from '../assets/next.png';
import loopIcon from '../assets/loop.png';

const Footer = () => (
  <footer className="footer">
    <div className="footer-left">
      <div className="playing-song"><img src={sampleImage} alt="Song" /></div>
      <div className="title-playing-song">
        <div className="song-title-line">
          <p className="song-title">Nỗi Đau Đính Kèm</p>
          <button className="btn-DC"><img src={plusIcon} alt="Add" /></button>
        </div>
        <p className="song-artist">Anh Tú Atus, RHYDER</p>
      </div>
    </div>
    <div className="music-player">
      <div className="music-controls">
        <button><img src={shuffleIcon} alt="Shuffle" /></button>
        <button><img src={prevIcon} alt="Prev" /></button>
        <button><img src={playIcon} alt="Play" /></button>
        <button><img src={nextIcon} alt="Next" /></button>
        <button><img src={loopIcon} alt="Repeat" /></button>
      </div>
      <div className="progress-container">
        <span className="current-time">2:14</span>
        <div className="progress-bar">
          <div className="current-progress"></div>
        </div>
        <span className="total-time">4:39</span>
      </div>
    </div>
  </footer>
);

export default Footer;
