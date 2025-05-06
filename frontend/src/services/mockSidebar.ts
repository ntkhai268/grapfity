// services/mockSidebar.ts
// Mock data for Sidebar Playlists and Artists
import img1 from "../assets/images/bacphan.jpg";
export interface Playlist {
    id: string;
    title: string;
    ownerName: string;
    coverUrl: string;
  }
  
  export interface Artist {
    id: string;
    name: string;
    imageUrl: string;
  }
  
  // Sample Playlists
  export const mockPlaylists: Playlist[] = [
    {
      id: "pl1",
      title: "Banger after Banger",
      ownerName: "Dianaherweg_",
      coverUrl: img1,
    },
    {
      id: "pl2",
      title: "Chill Hits",
      ownerName: "User123",
      coverUrl: img1,
    },
    {
      id: "pl3",
      title: "Rock Classics",
      ownerName: "Admin",
      coverUrl: img1,
    },
    {
      id: "pl4",
      title: "Jazz Vibes",
      ownerName: "MusicLover",
      coverUrl: img1,
    },
    {
      id: "pl5",
      title: "Jazz Vibes",
      ownerName: "MusicLover",
      coverUrl: img1,
    },
    {
      id: "pl6",
      title: "Jazz Vibes",
      ownerName: "MusicLover",
      coverUrl: img1,
    },
  ];
  
  // Sample Artists
  export const mockArtists: Artist[] = [
    {
      id: "art1",
      name: "Đen",
      imageUrl: img1,
    },
    {
      id: "art2",
      name: "Martin Jensen",
      imageUrl: img1,
    },
    {
      id: "art3",
      name: "Mike Perry",
      imageUrl: img1,
    },
    {
      id: "art4",
      name: "Alan Walker",
      imageUrl: img1,
    },
  ];
  