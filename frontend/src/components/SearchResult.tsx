// components/SearchResult.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import styles from "../styles/search-result.module.css";
import { fetchJoinedTracks, JoinedTrack } from "../services/trackService";
import {
  getMockFeaturingPlaylists,
  getMockAlbums,
} from "../services/mockData";

// Ánh xạ ảnh từ thư mục assets/images
const imageModules = import.meta.glob(
  "../assets/images/*.{png,jpg,jpeg,svg}",
  { eager: true, as: "url" }
);
const imageMap: Record<string, string> = {};
Object.entries(imageModules).forEach(([path, url]) => {
  const filename = path.split("/").pop();
  if (filename) imageMap[filename] = url as string;
});
function resolveImg(src: string) {
  const fileName = src.split("/").pop()!;
  return imageMap[fileName] || src;
}

export interface Artist {
  id: string;
  name: string;
  type: "artist";
  imageUrl: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  coverUrl: string;
  type: "song";
}

export interface Playlist {
  id: string;
  title: string;
  imageUrl: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
}

export type SearchResultItem = Artist | Song;

interface SearchResultProps {
  sidebarExpanded?: boolean;
}

const SearchResult: React.FC<SearchResultProps> = ({ sidebarExpanded }) => {
  const [params] = useSearchParams();
  const query = params.get("query") || "";

  const location = useLocation();
  const selectedTrack = (location.state as { selectedTrack?: JoinedTrack })
    ?.selectedTrack;

  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (!selectedTrack) return;
    fetchJoinedTracks()
      .then((tracks) => {
        const byArtist = tracks.filter(
          (t) => t.User.UploaderName === selectedTrack.User.UploaderName
        );
        const songItems: Song[] = byArtist.map((t) => ({
          id: t.id.toString(),
          title: t.Metadatum?.trackname || "",
          artist: t.User.UploaderName,
          duration: t.Metadatum?.release_date || "",
          coverUrl: t.imageUrl,
          type: "song",
        }));
        setSongs(songItems);
      })
      .catch((err) => console.error("Fetch tracks lỗi:", err));
  }, [selectedTrack]);

  if (!selectedTrack) {
    return (
      <div className={styles.search_result_section}>
        <p>Chưa có bài hát nào được chọn.</p>
      </div>
    );
  }

  const artists: Artist[] = [
    {
      id: selectedTrack.uploaderId.toString(),
      name: selectedTrack.User.UploaderName,
      type: "artist",
      imageUrl: selectedTrack.imageUrl,
    },
  ];

  const playlists = getMockFeaturingPlaylists(query);
  const albums = getMockAlbums(query);

  return (
    <div
      className={`${styles.search_result_section} ${
        sidebarExpanded ? styles.shrink : ""
      }`}
    >
      <div className={styles.top_row}>
        {/* Top result */}
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
                  {selectedTrack.User.UploaderName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Songs list */}
        <div className={styles.songsSection_result}>
          <h2 className={styles.sectionTitle_result}>Songs</h2>
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
                <span className={styles.songDuration_result}>
                  {s.duration}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Artists */}
      <div className={styles.artistsSection_result}>
        <h2 className={styles.sectionTitle_result}>Artists</h2>
        <div className={styles.artist_grid}>
          {artists.map((a) => (
            <div key={a.id} className={styles.artist_card}>
              <img
                src={resolveImg(a.imageUrl)}
                alt={a.name}
                className={styles.artist_avatar}
              />
              <p className={styles.grid_item_title}>{a.name}</p>
              <p className={styles.grid_item_sub}>Artist</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featuring Playlists */}
      <div className={styles.featuringSection_result}>
        <h2 className={styles.sectionTitle_result}>Featuring</h2>
        <div className={styles.grid_list}>
          {playlists.map((p) => (
            <div key={p.id} className={styles.grid_item}>
              <img
                src={resolveImg(p.imageUrl)}
                alt={p.title}
                className={styles.grid_item_img}
              />
              <p className={styles.grid_item_title}>{p.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Albums */}
      <div className={styles.albumSection_result}>
        <h2 className={styles.sectionTitle_result}>Albums</h2>
        <div className={styles.grid_list}>
          {albums.map((al) => (
            <div key={al.id} className={styles.grid_item}>
              <img
                src={resolveImg(al.imageUrl)}
                alt={al.title}
                className={styles.grid_item_img}
              />
              <p className={styles.grid_item_title}>{al.title}</p>
              <p className={styles.grid_item_sub}>
                {al.year} • {al.artist}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
