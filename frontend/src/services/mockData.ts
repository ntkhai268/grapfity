// mockData.ts

import { SearchResultItem, Song } from "../components/SearchResult"; // import type chính xác
import img1 from "../assets/images/bacphan.jpg";
// Top Result
export const mockTopResult: SearchResultItem = {
  id: "1",
  name: "Sơn Tùng M-TP",
  type: "artist",
  imageUrl: img1, // phải để trong thư mục public/images
};

// Songs List
export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Đừng Làm Trái Tim Anh Đau",
    artist: "Sơn Tùng M-TP",
    duration: "4:39",
    coverUrl: img1,
    type: "song",
  },
  {
    id: "2",
    title: "Chúng Ta Của Hiện Tại",
    artist: "Sơn Tùng M-TP",
    duration: "5:01",
    coverUrl: img1,
    type: "song",
  },
  {
    id: "3",
    title: "Buông Đôi Tay Nhau Ra",
    artist: "Sơn Tùng M-TP",
    duration: "3:47",
    coverUrl: img1,
    type: "song",
  },
  {
    id: "4",
    title: "Nắng Ấm Xa Dần",
    artist: "Sơn Tùng M-TP",
    duration: "3:11",
    coverUrl: img1,
    type: "song",
  },
];

// Featuring Playlists
export const mockFeaturingPlaylists = [
  {
    id: "playlist1",
    title: "Mãi Yêu Sơn Tùng M-TP",
    imageUrl: img1, 
  },
  {
    id: "playlist2",
    title: "Sơn Tùng M-TP Radio",

    imageUrl: img1,
  },
  {
    id: "playlist3",
    title: "Tiến Lên Việt Nam Ơi",

    imageUrl: img1,
  },
  {
    id: "playlist4",
    title: "EDM Gây Nghiện",

    imageUrl: img1,
  },
];

// Albums
export const mockAlbums = [
  {
    id: "album1",
    title: "Khuôn Mặt Đáng Thương",
    year: "2015",
    artist: "Sơn Tùng M-TP",
    imageUrl: img1,
  },
  {
    id: "album2",
    title: "Anh Sai Rồi",
    year: "2015",
    artist: "Sơn Tùng M-TP",
    imageUrl: img1,
  },
  {
    id: "album3",
    title: "Đừng Làm Trái Tim Anh Đau",
    year: "2024",
    artist: "Sơn Tùng M-TP",
    imageUrl: img1,
  },
  {
    id: "album4",
    title: "m-tp M-TP",
    year: "2017",
    artist: "Sơn Tùng M-TP",
    imageUrl: img1,
  },
  {
    id: "album5",
    title: "Chúng Ta Của Tương Lai",
    year: "2024",
    artist: "Sơn Tùng M-TP",
    imageUrl: img1,
  },
];
export const mockArtists = [
  {
    id: "artist1",
    name: "Sơn Tùng M-TP",
    imageUrl: img1,
  },
  {
    id: "artist2",
    name: "tlinh",
    imageUrl: img1,
  },
  {
    id: "artist3",
    name: "Minh Tốc & Lam",
    imageUrl: img1,
  },
  {
    id: "artist4",
    name: "Pháp Kiều",
    imageUrl: img1,
  },
  {
    id: "artist5",
    name: "Low G",
    imageUrl: img1,
  },
];

