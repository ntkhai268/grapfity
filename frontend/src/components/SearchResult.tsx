import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/search-result.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PlaylistContext, Song } from "../hooks/GlobalAudioManager";
import { encodeBase62WithPrefix  } from "../hooks/base62";

const BACKEND_URL = 'http://localhost:8080';
// Hàm map tạm thời từ TrackData sang Song (bạn có thể đặt ở nơi khác)
function normalizeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url; // đã chuẩn URL
  return `${BACKEND_URL}/${url.replace(/^\/+/, '')}`;
}

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

const convertTrackItemToSong = (track: TrackItem): Song => ({
  id: track.trackId,        // chuyển trackId → id
  title: track.title,
  artist: track.artist,
 cover: normalizeUrl(track.imageUrl),
  src: normalizeUrl(track.trackUrl) || "",      // chuyển trackUrl → src
});


type SearchItem = TrackItem | UserItem | PlaylistItem;

interface SearchResultProps {
  sidebarExpanded: boolean;
}

const SearchResult: React.FC<SearchResultProps> = ({ sidebarExpanded }) => {
  const location = useLocation();
  const [results, setResults] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [topResult, setTopResult] = useState<SearchItem | null>(null);
   const navigate = useNavigate();

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

  const handleClicktest = (
        song: Song,
        list: Song[],
        index: number,
        type: PlaylistContext['type'],
        contextId: string | number = type
        ) => {
            // 👉 1. Lưu vào localStorage để chống mất khi reload
            localStorage.setItem("viewedSong", JSON.stringify(song));
            localStorage.setItem("viewedPlaylist", JSON.stringify(list));
            localStorage.setItem("viewedIndex", index.toString());
            localStorage.setItem("currentContext", JSON.stringify({
                type,
                id: contextId,
                songs: list,
            }));
        
            // Mã hóa ID 
            const encodedId = encodeBase62WithPrefix(Number(song.id), 22); // hoặc 16-22 tùy độ dài bạn muốn
        
            //  Điều hướng sang trang ManagerSong, truyền kèm state
            navigate(`/ManagerSong/${encodedId}`, {
                state: {
                    songs: list,
                    currentIndex: index,
                    currentSong: song,
                    context: { id: contextId, type },
                },
            });
      };

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
            <div className={styles.artistCard_result}
             onClick={() => {
                console.log("Đã click vào topResult:", topResult);

                if (topResult.type === "user") {
                  console.log("✅ Đây là user, chuyển hướng đến:", `/profile/${topResult.userId}`);
                  navigate(`/profile/${topResult.userId}`);
                }

                if (topResult.type === "track") {
                  console.log("🎵 Đây là track, mở trang ManagerSong");
                  const song = convertTrackItemToSong(topResult);
                  handleClicktest(song, [song], 0, "search", "search");
                }

                if (topResult.type === "playlist") {
                  console.log("📂 Đây là playlist, chuyển hướng đến:", `/ManagerPlaylistLayout/${topResult.playlistId}`);
                  navigate(`/ManagerPlaylistLayout/${topResult.playlistId}`);
                }
              }}
              style={{
                cursor: topResult.type === "user" ? "pointer" : "default",
              }}
            >
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
               {tracks.map((t, index) =>(
                <li key={`track-${t.trackId}`} className={styles.songItem_result}
                  onClick={() => {
                    const song = convertTrackItemToSong(t);
                    const songList = tracks.map(convertTrackItemToSong);
                    handleClicktest(song, songList, index, "search", "search");
                  }}
                  style={{ cursor: "pointer" }}
                >
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
              <li key={`user-${u.userId}`} className={styles.artistItem_result}
                onClick={() => {
                  console.log("👤 Click vào artist:", u.name, "→ /profile/" + u.userId);
                  navigate(`/profile/${u.userId}`);
                }}
                style={{ cursor: "pointer" }}
              >
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
              <li key={`playlist-${p.playlistId}`} className={styles.playlistItem_result}
                 onClick={() => {
                    console.log("📂 Click playlist:", p.title, "→ /ManagerPlaylistLayout/" + p.playlistId);
                    navigate(`/ManagerPlaylistLayout/${p.playlistId}`);
                  }}
                  style={{ cursor: "pointer" }}
              >
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