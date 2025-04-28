import axios from 'axios'; // Bỏ import AxiosError
import { PlaylistData, TrackItem } from '../components/Manager_Playlists/ManagerDataPlaylist'; // Đảm bảo đường dẫn đúng

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api/playlists'; // Trỏ thẳng tới /api/playlists

// --- Hàm tiện ích tính thời gian ---
function calculateTimeAgo(createDate: string | Date | undefined): string {
    if (!createDate) return "Unknown time";
    try {
        const date = new Date(createDate);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (isNaN(seconds) || seconds < 0) return "Just now";
        let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    } catch (e) {
        console.error("Error calculating time ago:", e);
        return "Invalid date";
    }
}

/**
 * Ánh xạ dữ liệu thô từ API thành cấu trúc PlaylistData.
 * @param playlistFromApi Dữ liệu playlist thô từ backend.
 * @returns Đối tượng PlaylistData đã được định dạng.
 */
const mapApiDataToPlaylistData = (playlistFromApi: any): PlaylistData => ({
    id: playlistFromApi.id,
    title: playlistFromApi.title || "Untitled Playlist",
    artist: playlistFromApi.User?.userName || "Unknown Artist",
    timeAgo: calculateTimeAgo(playlistFromApi.createDate),
    cover: playlistFromApi.imageUrl || "/assets/default_playlist_cover.png",
    tracks: (playlistFromApi.Tracks || []).map((track: any): TrackItem => ({
        id: track.id,
        title: track.title || "Unknown Title",
        src: track.trackUrl || "",
        artist: track.User?.userName || "Unknown Artist",
        cover: track.imageUrl || "/assets/default_track_cover.png"
    }))
});


// --- Các hàm gọi API ---

/**
 * Lấy danh sách playlist của người dùng ĐÃ ĐĂNG NHẬP.
 */
export const getMyPlaylistsAPI = async (): Promise<PlaylistData[]> => {
    console.log("Attempting to fetch playlists for the logged-in user...");
    try {
        const response = await axios.get<any[]>(`${API_BASE_URL}/`, {
            withCredentials: true,
        });
        console.log("Fetched playlists data (raw):", response.data);
        const playlists = response.data.map(mapApiDataToPlaylistData);
        console.log("Formatted playlists data:", playlists);
        return playlists;

    } catch (error) { // error là 'unknown'
        console.error('Error fetching my playlists:', error);
        // --- SỬA LẠI CÁCH KIỂM TRA LỖI ---
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any; // Cast sang any để truy cập
            console.error('Server response status:', axiosError.response?.status);
            console.error('Server response data:', axiosError.response?.data);
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                 console.warn("Authentication error detected.");
            }
        } else if (error && typeof error === 'object' && 'request' in error) {
             const axiosError = error as any;
             console.error('No response received:', axiosError.request);
        } else if (error instanceof Error) {
             console.error('Generic error:', error.message);
        } else {
             console.error('Unknown error occurred:', error);
        }
        throw error;
    }
};

/**
 * Lấy chi tiết một playlist bằng ID.
 */
export const getPlaylistByIdAPI = async (id: string | number): Promise<PlaylistData | null> => {
    console.log(`Fetching playlist details for ID: ${id}`);
    try {
        const response = await axios.get<any>(`${API_BASE_URL}/${id}`);
        console.log(`Data received for playlist ${id}:`, response.data);
        const formattedPlaylist = mapApiDataToPlaylistData(response.data);
        console.log(`Formatted playlist data for ${id}:`, formattedPlaylist);
        return formattedPlaylist;

    } catch (error) { // error là 'unknown'
        console.error(`Error fetching playlist with id ${id}:`, error);
        // --- SỬA LẠI CÁCH KIỂM TRA LỖI ---
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Server response status:', axiosError.response?.status);
            console.error('Server response data:', axiosError.response?.data);
            if (axiosError.response?.status === 404) {
                console.log(`Playlist with ID ${id} not found (404).`);
                return null; // Trả về null nếu 404
            }
        } else if (error && typeof error === 'object' && 'request' in error) {
            const axiosError = error as any;
            console.error('No response received:', axiosError.request);
        } else if (error instanceof Error) {
            console.error('Generic error:', error.message);
        } else {
            console.error('Unknown error occurred:', error);
        }
        throw error; // Ném lại các lỗi khác 404
    }
};

/**
 * Tạo một playlist mới cho người dùng ĐÃ ĐĂNG NHẬP.
 */
export const createPlaylistAPI = async (trackId?: string | number | null): Promise<PlaylistData | null> => {
    console.log(`Attempting to create playlist`, trackId ? `from track: ${trackId}` : '(empty)');
    try {
        const response = await axios.post<any>(`${API_BASE_URL}/`,
            { trackId: trackId },
            { withCredentials: true }
        );
        console.log("Playlist created successfully (raw data):", response.data);
        const formattedNewPlaylist: PlaylistData = {
             id: response.data.id,
             title: response.data.title || "Untitled Playlist",
             artist: "Bạn",
             timeAgo: calculateTimeAgo(response.data.createDate),
             cover: response.data.imageUrl || "/assets/default_playlist_cover.png",
             tracks: response.data.Tracks?.map((track: any): TrackItem => ({
                 id: track.id,
                 title: track.title || "Unknown Title",
                 src: track.trackUrl || "",
                 artist: track.User?.userName || "Unknown Artist",
                 cover: track.imageUrl || "/assets/default_track_cover.png"
             })) || []
        };
        console.log("Formatted new playlist data:", formattedNewPlaylist);
        return formattedNewPlaylist;

    } catch (error) { // error là 'unknown'
        console.error("Error creating playlist via API:", error);
        // --- SỬA LẠI CÁCH KIỂM TRA LỖI ---
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Server response status:', axiosError.response?.status);
            console.error('Server response data:', axiosError.response?.data);
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                throw new Error('Unauthorized');
            }
            // Kiểm tra lỗi track không tồn tại từ backend (dựa vào message nếu có)
            if (axiosError.response?.status === 404 && axiosError.response?.data?.message?.includes('Track not found')) {
                 throw new Error('Bài hát dùng để tạo playlist không tồn tại.');
            }
        } else if (error && typeof error === 'object' && 'request' in error) {
            const axiosError = error as any;
            console.error('No response received:', axiosError.request);
        } else if (error instanceof Error) {
            console.error('Generic error:', error.message);
        } else {
            console.error('Unknown error occurred:', error);
        }
        throw error; // Ném lại các lỗi khác
    }
};

/**
 * Cập nhật thông tin playlist (title, imageUrl).
 */
export const updatePlaylistAPI = async (playlistId: string | number, title: string, imageUrl: string): Promise<PlaylistData | null> => {
     console.log(`Attempting to update playlist ID: ${playlistId}`);
     try {
         const response = await axios.put<any>(`${API_BASE_URL}/${playlistId}`,
             { title, imageUrl },
             { withCredentials: true }
         );
         console.log("Playlist updated successfully (raw data):", response.data);
         const updatedPlaylist = mapApiDataToPlaylistData(response.data);
         return updatedPlaylist;
     } catch (error) { // error là 'unknown'
         console.error(`Error updating playlist ID ${playlistId}:`, error);
         // --- SỬA LẠI CÁCH KIỂM TRA LỖI ---
         if (error && typeof error === 'object' && 'response' in error) {
             const axiosError = error as any;
             console.error('Server response status:', axiosError.response?.status);
             console.error('Server response data:', axiosError.response?.data);
             if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                 throw new Error('Không có quyền cập nhật playlist này.');
             }
             if (axiosError.response?.status === 404) {
                 throw new Error('Playlist không tồn tại.');
             }
         } else if (error && typeof error === 'object' && 'request' in error) {
             const axiosError = error as any;
             console.error('No response received:', axiosError.request);
         } else if (error instanceof Error) {
             console.error('Generic error:', error.message);
         } else {
             console.error('Unknown error occurred:', error);
         }
         throw error;
     }
};

// ----- Các hàm API khác -----
