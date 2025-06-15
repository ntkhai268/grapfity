//../src/services/trackService.ts
import axios from "axios";

// Interface representing a joined track item from the API
export interface JoinedTrack {
  id: number;
  trackUrl: string;
  imageUrl: string;
  uploaderId: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  Metadatum: {
    trackname?: string;
    release_date?: string;
  } | null;
  User: {
    UploaderName: string;
  };
  listeningHistories: {
    listenCount: number;
    createdAt: string;
    metadata: {
      trackname?: string;
      release_date?: string;
    } | null;
    listener: {
      id: number;
      Name: string;
    };
  }[];
}

// API response shape for joined tracks
export interface JoinedTracksResponse {
  message: string;
  data: JoinedTrack[];
}

// Fetches the joined tracks from the backend
export const fetchJoinedTracks = async (): Promise<JoinedTrack[]> => {
  const res = await axios.get<JoinedTracksResponse>(
    "http://localhost:8080/api/tracks/joined"
  );
  return res.data.data;
};

// Update a track's status (pending / approved / rejected)
export const updateTrackStatus = async (
  id: number,
  status: "pending" | "approved" | "rejected"
): Promise<JoinedTrack> => {
  const res = await axios.patch<{ message: string; data: JoinedTrack }>(
    `http://localhost:8080/api/tracks/${id}/status`,
    { status }
  );
  return res.data.data;
};
export const deleteTrack = async (id: number): Promise<{ message: string }> => {
  const res = await axios.delete<{ message: string }>(
    `http://localhost:8080/api/tracks/${id}`
  );
  return res.data;
};