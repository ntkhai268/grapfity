import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/search-result.module.css";
import { fetchJoinedTracks, JoinedTrack } from "../services/trackService";

// Map ảnh
const imageModules = import.meta.glob("../assets/images/*.{png,jpg,jpeg,svg}", {
  eager: true,
  as: "url",
});
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split("/").pop();
  if (filename) imageMap[filename] = url as string;
});
function resolveImg(src: string) {
  const fileName = src.split("/").pop()!;
  return imageMap[fileName] || src;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  createdAt: string;
  coverUrl: string;
}

// ✅ Khai báo props từ layout
interface SearchResultProps {
  sidebarExpanded?: boolean;
}

const SearchResult: React.FC<SearchResultProps> = ({ sidebarExpanded }) => {
  const location = useLocation();
  const [selectedTrack, setSelectedTrack] = useState<JoinedTrack | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const stateTrack = (location.state as { selectedTrack?: JoinedTrack })?.selectedTrack;
    if (stateTrack) {
      setSelectedTrack(stateTrack);
      localStorage.setItem("selectedTrack", JSON.stringify(stateTrack));
    } else {
      const saved = localStorage.getItem("selectedTrack");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSelectedTrack(parsed);
        } catch (err) {
          console.error("Lỗi khi đọc localStorage:", err);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!selectedTrack) return;
    fetchJoinedTracks()
      .then((tracks) => {
        const related = tracks.filter(
          (t) => t.User?.UploaderName === selectedTrack.User?.UploaderName
        );
        const formatted: Song[] = related.map((t) => ({
          id: t.id.toString(),
          title: t.Metadatum?.trackname || `Track ${t.id}`,
          artist: t.User?.UploaderName || "Không rõ",
          createdAt: new Date(t.createdAt).toLocaleDateString("vi-VN"),
          coverUrl: t.imageUrl,
        }));
        setSongs(formatted);
      })
      .catch((err) => console.error("Lỗi fetch:", err));
  }, [selectedTrack]);

  if (!selectedTrack) {
    return (
      <div className={styles.search_result_section}>
        <p>Không có bài hát nào được chọn.</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.search_result_section} ${
        sidebarExpanded ? styles.shrink : ""
      }`}
    >
      <div className={styles.top_row}>
        <div className={styles.topResultSection_result}>
          <h2 className={styles.sectionTitle_result}>Top result</h2>
          <div className={styles.songCard_result}>
            <div className={styles.songInfoTop_result}>
              <img
                src={resolveImg(selectedTrack.imageUrl)}
                alt={selectedTrack.Metadatum?.trackname}
                width={150}
                height={150}
                className={styles.songCoverTop_result}
              />
              <div className={styles.songDetails_result}>
                <h1 className={styles.songTitleTop_result}>
                  {selectedTrack.Metadatum?.trackname}
                </h1>
                <p className={styles.songArtistTop_result}>
                  {selectedTrack.User?.UploaderName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Songs */}
        <div className={styles.songsSection_result}>
          <h2 className={styles.sectionTitle_result}>More from artist</h2>
          <ul className={styles.songsList_result}>
            {songs.map((s) => (
              <li key={s.id} className={styles.songItem_result}>
                <div className={styles.songInfo_result}>
                  <img
                    src={resolveImg(s.coverUrl)}
                    alt={s.title}
                    width={50}
                    height={50}
                    className={styles.songCover_result}
                  />
                  <div className={styles.songDetails_result}>
                    <p className={styles.songTitle_result}>{s.title}</p>
                    <p className={styles.songArtist_result}>{s.artist}</p>
                  </div>
                </div>
                <span className={styles.songDuration_result}>{s.createdAt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
