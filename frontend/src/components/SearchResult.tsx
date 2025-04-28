"use client";

import styles from "../styles/search-result.module.css";
import {
  mockTopResult,
  mockSongs,
  mockFeaturingPlaylists,
  mockArtists,
  mockAlbums,
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
  return (
    <div className={`${styles.search_result_section} ${sidebarExpanded ? styles.shrink : ""}`}>
      
      {/* Top row: Top Result + Songs */}
      <div className={styles.top_row}>
        {/* Top Result */}
        <div className={styles.topResultSection_result}>
          <h2 className={styles.sectionTitle_result}>Top result</h2>
          {mockTopResult.type === "artist" ? (
            <div className={styles.artistCard_result}>
              <div className={styles.artistImageContainer_result}>
                <img
                  src={mockTopResult.imageUrl}
                  alt={mockTopResult.name}
                  width={150}
                  height={150}
                  className={styles.artistImage_result}
                />
              </div>
              <h1 className={styles.artistName_result}>{mockTopResult.name}</h1>
              <p className={styles.artistLabel_result}>Artist</p>
            </div>
          ) : (
            <div className={styles.songCard_result}>
              <div className={styles.songInfoTop_result}>
                <img
                  src={(mockTopResult as Song).coverUrl}
                  alt={(mockTopResult as Song).title}
                  width={150}
                  height={150}
                  className={styles.songCoverTop_result}
                />
                <div className={styles.songDetails_result}>
                  <h1 className={styles.songTitleTop_result}>{(mockTopResult as Song).title}</h1>
                  <p className={styles.songArtistTop_result}>{(mockTopResult as Song).artist}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Songs List */}
        <div className={styles.songsSection_result}>
          <h2 className={styles.sectionTitle_result}>Songs</h2>
          <div className={styles.songCardList_result}>
            <ul className={styles.songsList_result}>
              {mockSongs.map((song) => (
                <li key={song.id} className={styles.songItem_result}>
                  <div className={styles.songInfo_result}>
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      width={50}
                      height={50}
                      className={styles.songCover_result}
                    />
                    <div className={styles.songDetails_result}>
                      <p className={styles.songTitle_result}>{song.title}</p>
                      <p className={styles.songArtist_result}>{song.artist}</p>
                    </div>
                  </div>
                  <span className={styles.songDuration_result}>{song.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Featuring Section */}
      <div className={styles.featuringSection_result}>
        <h2 className={styles.sectionTitle_result}>Featuring</h2>
        <div className={styles.grid_list}>
          {mockFeaturingPlaylists.map((playlist) => (
            <div key={playlist.id} className={styles.grid_item}>
              <img
                src={playlist.imageUrl}
                alt={playlist.title}
                className={styles.grid_item_img}
              />
              <p className={styles.grid_item_title}>{playlist.title}</p>
            </div>
          ))}
        </div>
      </div>
          {/* Artists Section */}
<div className={styles.artistsSection_result}>
  <h2 className={styles.sectionTitle_result}>Artists</h2>
  <div className={styles.artist_grid}>
    {mockArtists.map((artist) => (
      <div key={artist.id} className={styles.artist_card}>
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className={styles.artist_avatar}
        />
        <p className={styles.grid_item_title}>{artist.name}</p>
        <p className={styles.grid_item_sub}>Artist</p>
      </div>
    ))}
  </div>
</div>

      {/* Album Section */}
      <div className={styles.albumSection_result}>
        <h2 className={styles.sectionTitle_result}>Albums</h2>
        <div className={styles.grid_list}>
          {mockAlbums.map((album) => (
            <div key={album.id} className={styles.grid_item}>
              <img
                src={album.imageUrl}
                alt={album.title}
                className={styles.grid_item_img}
              />
              <p className={styles.grid_item_title}>{album.title}</p>
              <p className={styles.grid_item_sub}>
                {album.year} • {album.artist}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SearchResult;
