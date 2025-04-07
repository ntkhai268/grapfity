import '/Users/dangkhoii/Documents/Graptify/frontend/src/styles/Section.css'; // ✅ thêm dòng này

import sampleImage from '../assets/anhmau.png';

const Section = () => (
  <section className="song_side">
    <h1>Recommended for today</h1>
    <div className="song-list">
      {[1, 2, 3, 4].map((_, i) => (
        <div key={i} className="song-item">
          <img src={sampleImage} alt="Track" />
          <p className="title">Song Title</p>
          <p className="artist">Artist</p>
        </div>
      ))}
    </div>
  </section>
);

export default Section;
