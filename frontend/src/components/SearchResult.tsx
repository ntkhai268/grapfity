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
  return imageMap[fileName] || "";
}

const getInitialLetter = (name: string) => {
  return name?.charAt(0)?.toUpperCase() || "?";
};

const renderImageOrLetter = (
  imageUrl: string | undefined,
  fallbackName: string,
  className: string,
  shape: "circle" | "square" = "circle"
) => {
  const resolved = imageUrl ? resolveImg(imageUrl) : "";
  const isValid = resolved && !resolved.includes("undefined");

  if (isValid) {
    return <img src={resolved} alt={fallbackName} className={className} />;
  } else {
    return (
      <div
        className={`${styles.letterAvatar_result} ${className} ${
          shape === "square" ? styles.square : ""
        }`}
      >
        {getInitialLetter(fallbackName)}
      </div>
    );
  }
};

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
    const q = searchParams.get("query")?.trim() || "";
    setQuery(q);

    if (!q) return;

    axios
      .get(`http://localhost:8080/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => {
        const mapped: SearchItem[] = (res.data as any[]).map((item): SearchItem => {

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

        const keyword = q.toLowerCase();
        const exactTrack = mapped.find(
          (item) => item.type === "track" && item.title.toLowerCase().includes(keyword)
        );
        const exactPlaylist = mapped.find(
          (item) => item.type === "playlist" && item.title.toLowerCase().includes(keyword)
        );
        const exactUser = mapped.find(
          (item) => item.type === "user" && item.name.toLowerCase().includes(keyword)
        );

        const top = exactTrack || exactPlaylist || exactUser || mapped[0] || null;
        setTopResult(top);
      })
      .catch((err) => console.error("Lỗi khi tìm kiếm:", err));
  }, [location.search]);

  const tracks = results.filter((r): r is TrackItem => r.type === "track");
  const users = results.filter((r): r is UserItem => r.type === "user");
  const playlists = results.filter((r): r is PlaylistItem => r.type === "playlist");

  const primaryArtistName = tracks[0]?.artist ?? null;

  const relatedArtists = primaryArtistName
    ? users.filter((u) => u.name.toLowerCase() === primaryArtistName.toLowerCase())
    : [];

  const hasArtistInUsers = relatedArtists.length > 0;

  const syntheticArtist: UserItem[] =
    !hasArtistInUsers && primaryArtistName
      ? [
          {
            type: "user",
            userId: -1,
            name: primaryArtistName,
            username: primaryArtistName.toLowerCase().replace(/\s+/g, "_"),
          },
        ]
      : [];

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

      <div className={styles.top_row}>
        {topResult && (
          <div className={styles.topResultSection_result}>
            <h3 className={styles.sectionTitle_result}>Kết quả hàng đầu</h3>
            <div className={styles.artistCard_result}>
              <div className={styles.artistImageContainer_result}>
                {renderImageOrLetter(
                  (topResult as any).imageUrl,
                  (topResult as any).title || (topResult as any).name,
                  styles.artistImage_result,
                  "square"
                )}
              </div>
              <div className={styles.songInfoTop_result}>
                <p className={styles.songTitleTop_result}>
                  {(topResult as any).title || (topResult as any).name}
                </p>
                <p className={styles.songArtistTop_result}>
                  {topResult.type === "track" && `Bài hát • ${topResult.artist}`}
                  {topResult.type === "playlist" && `Playlist`}
                  {topResult.type === "user" && `@${(topResult as UserItem).username}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {tracks.length > 0 && (
          <div className={styles.songsSection_result}>
            <h3 className={styles.sectionTitle_result}>Bài hát</h3>
            <ul className={styles.songsList_result}>
              {tracks.slice(0, 4).map((t) => (
                <li key={`track-${t.trackId}`} className={styles.songItem_result}>
                  <div className={styles.songInfo_result}>
                    {renderImageOrLetter(t.imageUrl, t.title, styles.songCover_result, "square")}
                    <div className={styles.songDetails_result}>
                      <p className={styles.songTitle_result}>{t.title}</p>
                      <p className={styles.songArtist_result}>{t.artist}</p>
                    </div>
                  </div>
                  <span className={styles.songDuration_result}>3:52</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(relatedArtists.length > 0 || syntheticArtist.length > 0) && (
        <div className={styles.resultGroup}>
          <h3 className={styles.sectionTitle_result}>Nghệ sĩ</h3>
          <ul className={styles.artistList_result}>
            {[...relatedArtists, ...syntheticArtist].map((u) => (
              <li key={`user-${u.userId}`} className={styles.artistItem_result}>
                {renderImageOrLetter("", u.name, styles.artistAvatar_result)}
                <p className={styles.artistName_result}>{u.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {playlists.length > 0 && (
        <div className={styles.resultGroup}>
          <h3 className={styles.sectionTitle_result}>Playlist</h3>
          <ul className={styles.playlistList_result}>
            {playlists.map((p) => (
              <li key={`playlist-${p.playlistId}`} className={styles.playlistItem_result}>
                {renderImageOrLetter(p.imageUrl, p.title, styles.playlistCover_result, "square")}
                <p className={styles.playlistTitle_result}>{p.title}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tracks.length === 0 && users.length === 0 && playlists.length === 0 && (
        <p>Không tìm thấy kết quả nào phù hợp.</p>
      )}
    </div>
  );
};

export default SearchResult;
