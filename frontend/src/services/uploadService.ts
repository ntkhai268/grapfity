// src/services/uploadService.ts
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

export interface MinimalTrack {
  id: number;
  trackUrl: string;
  imageUrl: string;
  uploaderId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id?: number; // optional vì trong dữ liệu hiện tại không có id
  UploaderName: string;
}

export interface TrackWithCount extends MinimalTrack {
  listenCount: number;
  trackName: string | null;
  artist?: Artist;
}

// Chuyển '../public/assets/...' hoặc '../assets/...' → '/assets/...'
function toPublicPath(p: string): string {
  return p
    .replace(/^\.\.\/public/, '')
    .replace(/^(?:\.\.\/)+/, '/')
    .replace(/^\/+/, '/');
}

export async function getUserTracks(): Promise<TrackWithCount[]> {
  const res = await axios.get<{
    message: string;
    data: Array<{
      id: number;
      trackUrl: string;
      imageUrl: string;
      uploaderId: number;
      createdAt: string;
      updatedAt: string;
      User: { UploaderName: string };
      listeningHistories: Array<{
        metadata: { trackname: string } | null;
        listenCount: number;
        listener: { id: number; Name: string };
      }>;
    }>;
  }>('/api/tracks/user');

  const tracks: TrackWithCount[] = res.data.data.map(item => {
    const totalCount = item.listeningHistories.reduce(
      (sum, h) => sum + h.listenCount,
      0
    );

    const metaEntry = item.listeningHistories.find(h => h.metadata?.trackname);
    const trackName = metaEntry?.metadata?.trackname ?? null;

    const base: MinimalTrack = {
      id: item.id,
      trackUrl: toPublicPath(item.trackUrl),
      imageUrl: toPublicPath(item.imageUrl),
      uploaderId: item.uploaderId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };

    return {
      ...base,
      listenCount: totalCount,
      trackName,
      artist: item.User ? { UploaderName: item.User.UploaderName } : undefined,
    };
  });

  tracks.sort((a, b) => b.listenCount - a.listenCount);
  return tracks;
}
