import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/search-result.module.css";
import axios from "axios";

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

type TrackItem = {
  type: "track";
  trackId: number;
  title: string;
  artist: string;
  uploaderId: number;
  imageUrl: string;
  trackUrl: string;
};

type UserItem = {
  type: "user";
  userId: number;
  name: string;
  username: string;
};

type PlaylistItem = {
  type: "playlist";
  playlistId: number;
  title: string;
  ownerId: number;
  imageUrl: string;
};

type SearchItem = TrackItem | UserItem | PlaylistItem;

interface SearchResultProps {
  sidebarExpanded: boolean;
}

const SearchResult: React.FC<SearchResultProps> = ({ sidebarExpanded }) => {
  const location = useLocation();
  const [results, setResults] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [topResult, setTopResult] = useState<SearchItem | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get("query")?.trim();
    setQuery(q || "");
    if (!q) return;

    axios
      .get(`http://localhost:8080/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => {
        const mapped: SearchItem[] = res.data.map((item: any): SearchItem => {
          if (item.type === "track") {
            return {
              type: "track",
              trackId: item.trackId,
              title: item.title,
              artist: item.artist,
              uploaderId: item.uploaderId,
              imageUrl: item.imageUrl,
              trackUrl: item.trackUrl,
            };
          } else if (item.type === "user") {
            return {
              type: "user",
              userId: item.userId,
              name: item.name,
              username: item.username,
            };
          } else if (item.type === "playlist") {
            return {
              type: "playlist",
              playlistId: item.playlistId,
              title: item.title,
              ownerId: item.userId,
              imageUrl: item.imageUrl,
            };
          } else {
            throw new Error("Unknown item type");
          }
        });
        setResults(mapped);
        setTopResult(mapped[0] || null);
      })
      .catch((err) => console.error("Lỗi khi tìm kiếm:", err));
  }, [location.search]);

  const tracks = results.filter((r): r is TrackItem => r.type === "track");
  const users = results.filter((r): r is UserItem => r.type === "user");
  const playlists = results.filter((r): r is PlaylistItem => r.type === "playlist");

  if (!query) {
    return (
      <div className={styles.search_result_section}>
        <p>Không có từ khóa tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.search_result_section} ${sidebarExpanded ? styles.shrink : ""}`}>
      <h2 className={styles.sectionTitle_result}>Kết quả cho: <em>{query}</em></h2>

      {/* --- Top result + Songs --- */}
      <div className={styles.topGrid_result}>
        {topResult && (
          <div className={styles.topResultCard}>
            <h3 className={styles.sectionTitle_result}>Top result</h3>
            <div className={styles.topResultContent}>
              <img
                src={resolveImg((topResult as any).imageUrl || "/assets/iconnguoidung.png")}
                alt={(topResult as any).title || (topResult as any).name}
                className={styles.songCoverTop_result}
              />
              <div className={styles.songDetails_result}>
                <h1 className={styles.songTitleTop_result}>
                  {(topResult as any).title || (topResult as any).name}
                </h1>
                <p className={styles.songArtistTop_result}>
                  {topResult.type === "track" && (topResult as TrackItem).artist}
                  {topResult.type === "playlist" && `Playlist #${(topResult as PlaylistItem).playlistId}`}
                  {topResult.type === "user" && `@${(topResult as UserItem).username}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {tracks.length > 0 && (
          <div className={styles.songListWrapper}>
            <h3 className={styles.sectionTitle_result}>Songs</h3>
            <ul className={styles.songsList_result}>
              {tracks.map((t) => (
                <li key={`track-${t.trackId}`} className={styles.songItem_result}>
                  <div className={styles.songInfo_result}>
                    <img
                      src={resolveImg(t.imageUrl)}
                      alt={t.title}
                      className={styles.songCover_result}
                    />
                    <div className={styles.songDetails_result}>
                      <p className={styles.songTitle_result}>{t.title}</p>
                      <p className={styles.songArtist_result}>{t.artist}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* --- Artists --- */}
      {users.length > 0 && (
        <div className={styles.resultGroup}>
          <h3 className={styles.sectionTitle_result}>Artists</h3>
          <ul className={styles.artistList_result}>
            {users.map((u) => (
              <li key={`user-${u.userId}`} className={styles.artistItem_result}>
                <img
                  src={resolveImg("/assets/iconnguoidung.png")}
                  alt={u.name}
                  className={styles.artistAvatar_result}
                />
                <p className={styles.artistName_result}>{u.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Playlists --- */}
      {playlists.length > 0 && (
        <div className={styles.resultGroup}>
          <h3 className={styles.sectionTitle_result}>Playlists</h3>
          <ul className={styles.playlistList_result}>
            {playlists.map((p) => (
              <li key={`playlist-${p.playlistId}`} className={styles.playlistItem_result}>
                <img
                  src={resolveImg(p.imageUrl)}
                  alt={p.title}
                  className={styles.playlistCover_result}
                />
                <p className={styles.playlistTitle_result}>{p.title}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- No results --- */}
      {tracks.length === 0 && users.length === 0 && playlists.length === 0 && (
        <p>Không tìm thấy kết quả nào phù hợp.</p>
      )}
    </div>
  );
};

export default SearchResult;
