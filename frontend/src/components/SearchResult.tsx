// components/SearchResult.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import styles from "../styles/search-result.module.css";
import {
  getMockTopResult,
  getMockSongs,
  getMockFeaturingPlaylists,
  getMockArtists,
  getMockAlbums,
} from "../services/mockData";

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

export type SearchResultItem = Artist | Song;

interface SearchResultProps {
  sidebarExpanded?: boolean;
}

const SearchResult: React.FC<SearchResultProps> = ({ sidebarExpanded }) => {
  const [params] = useSearchParams();
  const query = params.get("query") || "";

  const topResult = getMockTopResult(query);
  const songs     = getMockSongs(query);
  const artists   = getMockArtists(query);
  const playlists = getMockFeaturingPlaylists(query);
  const albums    = getMockAlbums(query);

  return (
    <div className={`${styles.search_result_section} ${sidebarExpanded ? styles.shrink : ""}`}>
      
      {/* -- Bọc thành 1 hàng ngang -- */}
      <div className={styles.top_row}>
        
        {/* Top Result */}
        <div className={styles.topResultSection_result}>
          <h2 className={styles.sectionTitle_result}>Top result</h2>
          {topResult.type === "artist" ? (
            <div className={styles.artistCard_result}>
              <div className={styles.artistImageContainer_result}>
                <img
                  src={topResult.imageUrl}
                  alt={topResult.name}
                  width={150}
                  height={150}
                  className={styles.artistImage_result}
                />
              </div>
              <h1 className={styles.artistName_result}>{topResult.name}</h1>
              <p className={styles.artistLabel_result}>Artist</p>
            </div>
          ) : (
            <div className={styles.songCard_result}>
              <div className={styles.songInfoTop_result}>
                <img
                  src={(topResult as Song).coverUrl}
                  alt={(topResult as Song).title}
                  width={150}
                  height={150}
                  className={styles.songCoverTop_result}
                />
                <div className={styles.songDetails_result}>
                  <h1 className={styles.songTitleTop_result}>{(topResult as Song).title}</h1>
                  <p className={styles.songArtistTop_result}>{(topResult as Song).artist}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Songs List */}
        <div className={styles.songsSection_result}>
          <h2 className={styles.sectionTitle_result}>Songs</h2>
          <ul className={styles.songsList_result}>
            {songs.map((s) => (
              <li key={s.id} className={styles.songItem_result}>
                <div className={styles.songInfo_result}>
                  <img
                    src={s.coverUrl}
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
                <span className={styles.songDuration_result}>{s.duration}</span>
              </li>
            ))}
          </ul>
        </div>

      </div> {/* -- end top_row -- */}

      {/* Các section tiếp theo vẫn giữ nguyên */}
      <div className={styles.artistsSection_result}>
        <h2 className={styles.sectionTitle_result}>Artists</h2>
        <div className={styles.artist_grid}>
          {artists.map((a) => (
            <div key={a.id} className={styles.artist_card}>
              <img src={a.imageUrl} alt={a.name} className={styles.artist_avatar} />
              <p className={styles.grid_item_title}>{a.name}</p>
              <p className={styles.grid_item_sub}>Artist</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.featuringSection_result}>
        <h2 className={styles.sectionTitle_result}>Featuring</h2>
        <div className={styles.grid_list}>
          {playlists.map((p) => (
            <div key={p.id} className={styles.grid_item}>
              <img src={p.imageUrl} alt={p.title} className={styles.grid_item_img} />
              <p className={styles.grid_item_title}>{p.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.albumSection_result}>
        <h2 className={styles.sectionTitle_result}>Albums</h2>
        <div className={styles.grid_list}>
          {albums.map((al) => (
            <div key={al.id} className={styles.grid_item}>
              <img src={al.imageUrl} alt={al.title} className={styles.grid_item_img} />
              <p className={styles.grid_item_title}>{al.title}</p>
              <p className={styles.grid_item_sub}>{al.year} • {al.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
