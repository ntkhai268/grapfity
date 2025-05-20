// services/mockData.ts

import { SearchResultItem, Song, Artist } from "../components/SearchResult";
import img1 from "../assets/images/bacphan.jpg";
import img2 from "/Users/dangkhoii/Desktop/grapfity/frontend/src/assets/images/lactroi.jpg";
import img3 from "/Users/dangkhoii/Desktop/grapfity/frontend/src/assets/images/dunglamtraitimanhdau.jpg"
import img4 from "/Users/dangkhoii/Desktop/grapfity/frontend/src/assets/images/chungtacuahientai.jpg"
import img5 from "/Users/dangkhoii/Desktop/grapfity/frontend/src/assets/images/châcidoseve.jpg"
import img6 from "/Users/dangkhoii/Desktop/grapfity/frontend/src/assets/images/anhsairoi.jpg"
import img7 from "/Users/dangkhoii/Desktop/grapfity/frontend/src/assets/images/sontung.jpeg"
// ---- Dữ liệu mẫu chung cho tất cả songs ----
const ALL_SONGS: Song[] = [
  {
    id: "1",
    title: "Đừng Làm Trái Tim Anh Đau",
    artist: "Sơn Tùng M-TP",
    duration: "4:39",
    coverUrl: img3,
    type: "song",
  },
  {
    id: "2",
    title: "Chúng Ta Của Hiện Tại",
    artist: "Sơn Tùng M-TP",
    duration: "5:01",
    coverUrl: img4,
    type: "song",
  },
  {
    id: "3",
    title: "Chắc Ai Đó Sẽ Về",
    artist: "Sơn Tùng M-TP",
    duration: "4:22",
    coverUrl: img5,
    type: "song",
  },
  {
    id: "4",
    title: "Anh Sai Rồi",
    artist: "Sơn Tùng M-TP",
    duration: "4:12",
    coverUrl: img6,
    type: "song",
  },
  {
    id: "100",
    title: "Lạc trôi",
    artist: "Sơn Tùng M-TP",
    duration: "4:02",
    coverUrl: img1,
    type: "song",
  },
];

// ---- Hàm trả về Top result ----
export function getMockTopResult(query: string): SearchResultItem {
  if (query === "Sơn Tùng") {
    return {
      id: "artist1",
      name: "Sơn Tùng M-TP",
      type: "artist",
      imageUrl: img7,
    };
  }
  if (query === "Lạc trôi") {
    return {
      id: "song100",
      title: "Lạc trôi",
      artist: "Sơn Tùng M-TP",
      duration: "4:02",
      coverUrl: img2,
      type: "song",
    };
  }
  // fallback nếu không khớp query
  return {
    id: "artist0",
    name: "Không tìm thấy",
    type: "artist",
    imageUrl: img1,
  };
}

// ---- Hàm trả về danh sách Songs (luôn 4 bài) ----
export function getMockSongs(query: string): Song[] {
  const top = getMockTopResult(query);

  let filtered: Song[];
  if (top.type === "song") {
    // nếu Top result là song, lấy tất cả bài cùng artist
    filtered = ALL_SONGS.filter((s) => s.artist === top.artist);
  } else {
    // nếu Top result là artist, lấy theo tên artist
    filtered = ALL_SONGS.filter((s) => s.artist === top.name);
  }

  // nếu không có bài nào, fallback về 4 bài đầu của ALL_SONGS
  if (filtered.length === 0) {
    return ALL_SONGS.slice(0, 4);
  }

  // luôn trả về tối đa 4 bài
  return filtered.slice(0, 4);
}

// ---- Hàm trả về Artists ----
export function getMockArtists(query: string): Artist[] {
  const top = getMockTopResult(query);

  // dù top là artist hay song, đều lấy artist theo tên
  const artistName = top.type === "artist" ? top.name : (top as Song).artist;

  return [
    {
      id: `artist_${artistName.replace(/\s+/g, "")}`,
      name: artistName,
      type: "artist",
      imageUrl: img7,
    },
  ];
}

// ---- Các section khác (giữ tĩnh hoặc filter tuỳ ý) ----
export function getMockFeaturingPlaylists(_q: string) {
  return [
    { id: "playlist1", title: "Mãi Yêu Sơn Tùng M-TP", imageUrl: img1 },
    { id: "playlist2", title: "EDM Gây Nghiện",         imageUrl: img1 },
  ];
}

export function getMockAlbums(_q: string) {
  return [
    {
      id: "album1",
      title: "Khuôn Mặt Đáng Thương",
      year: "2015",
      artist: "Sơn Tùng M-TP",
      imageUrl: img1,
    },
  ];
}