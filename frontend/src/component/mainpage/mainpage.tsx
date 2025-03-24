import './mainpage.css'; // Đảm bảo file này tồn tại trong src/component/mainpage/
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';

// Sửa đường dẫn assets dựa trên cấu trúc thư mục
import spotifyLogo from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/spotify.png';
import homeIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/home.png';
import bellIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/bell.png';
import userIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/iconnguoidung.png';
import stackIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/stack.png';
import musicNoteIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/notnhac.png';
import sampleImage from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/anhmau.png';
import plusIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/plus.png';
import shuffleIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/shuffle.png';
import prevIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/prev.png';
import playIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/play.png';
import nextIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/next.png';
import loopIcon from '/Users/dangkhoii/Documents/Graptify/frontend/src/assets/loop.png';


function MainPage() {
  return (
    <>
      {/* Header */}
      <header>
        <h1>
          <img src={spotifyLogo} alt="Spotify" />
        </h1>
        <button className="btn-MP">
          <img src={homeIcon} alt="Trang chủ" />
        </button>
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} />
          <input type="text" placeholder="What do you want to play?" />
          <div className="divider"></div>
          <FontAwesomeIcon icon={faTrash} />
        </div>
        <button className="btn-TB">
          <img src={bellIcon} alt="Thông báo" />
        </button>
        <button className="btn-ND">
          <img src={userIcon} alt="Người dùng" />
        </button>
      </header>

      {/* Container */}
      <div className="container">
        {/* Sidebar */}
        <aside className="sidebar">
          <button className="btn-YL">
            <img src={stackIcon} alt="Your library" />
          </button>
          <button className="btn-NN">
            <img src={musicNoteIcon} alt="Your library" />
          </button>
        </aside>

        {/* Song Section */}
        <section className="song_side">
          <h1>Recommended for today</h1>
          <div className="song-list">
            <div className="song-item">
              <img src={sampleImage} alt="Hai đứa nhóc" />
              <p className="title">Hai đứa nhóc</p>
              <p className="artist">Ronboogz</p>
            </div>
            <div className="song-item">
              <img src={sampleImage} alt="Từng Ngày Như Mãi Mãi" />
              <p className="title">Từng Ngày Như Mãi Mãi</p>
              <p className="artist">buitruonglinh</p>
            </div>
            <div className="song-item">
              <img src={sampleImage} alt="Nỗi Đau Đính Kèm" />
              <p className="title">Nỗi Đau Đính Kèm</p>
              <p className="artist">Anh Tú Atus, RHYDER</p>
            </div>
            <div className="song-item">
              <img src={sampleImage} alt="Ba Da Bum" />
              <p className="title">Ba Da Bum</p>
              <p className="artist">B Ray</p>
            </div>
          </div>

          <h2>Popular albums and singles</h2>
          <div className="song-list">
            <div className="song-item">
              <img src={sampleImage} alt="Hai đứa nhóc" />
              <p className="title">Hai đứa nhóc</p>
              <p className="artist">Ronboogz</p>
            </div>
            <div className="song-item">
              <img src={sampleImage} alt="Từng Ngày Như Mãi Mãi" />
              <p className="title">Từng Ngày Như Mãi Mãi</p>
              <p className="artist">buitruonglinh</p>
            </div>
            <div className="song-item">
              <img src={sampleImage} alt="Nỗi Đau Đính Kèm" />
              <p className="title">Nỗi Đau Đính Kèm</p>
              <p className="artist">Anh Tú Atus, RHYDER</p>
            </div>
            <div className="song-item">
              <img src={sampleImage} alt="Ba Da Bum" />
              <p className="title">Ba Da Bum</p>
              <p className="artist">B Ray</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          <div className="playing-song">
            <img src={sampleImage} alt="Nỗi Đau Đính Kèm" />
          </div>
          <div className="title-playing-song">
            <p className="song-title">Nỗi Đau Đính Kèm</p>
            <p className="song-artist">Anh Tú Atus, RHYDER</p>
          </div>
        </div>
        <div className="footer-right">
          <button className="btn-DC">
            <img src={plusIcon} alt="" />
          </button>
        </div>
        <div className="music-player">
          <div className="music-controls">
            <button className="shuffle">
              <img src={shuffleIcon} alt="Shuffle" />
            </button>
            <button className="prev">
              <img src={prevIcon} alt="Previous" />
            </button>
            <button className="play-pause">
              <img src={playIcon} alt="Play" />
            </button>
            <button className="next">
              <img src={nextIcon} alt="Next" />
            </button>
            <button className="repeat">
              <img src={loopIcon} alt="Repeat" />
            </button>
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
    </>
  );
}

export default MainPage;