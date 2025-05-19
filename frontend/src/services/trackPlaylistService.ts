// src/services/trackPlaylistService.ts
import axios from 'axios';
 // Op không dùng ở frontend, có thể xóa nếu chỉ copy/paste
import {mapApiDataToPlaylistData} from "./playlistService"
import { PlaylistData } from '../components/Manager_Playlists/ManagerDataPlaylist';


interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}

// ---------------------------------

const API_BASE_URL_PLAYLISTS = 'http://localhost:8080/api/playlists';



// --- Hàm gọi API ---

/**
 * Lấy thông tin chi tiết một playlist bằng ID (bao gồm cả tracks).
 * Gọi đến endpoint: GET /api/playlists/:playlistId
 * @param playlistId ID của Playlist.
 * @returns Promise chứa object PlaylistData hoặc null nếu không tìm thấy.
 * @throws {Error} Nếu có lỗi khác xảy ra.
 */
export const getTracksInPlaylistAPI = async (id: string | number): Promise<PlaylistData | null> => {
    console.log(`Fetching playlist details for ID: ${id}`);
    try {
        const response = await axios.get<any>(`${API_BASE_URL_PLAYLISTS}/${id}`);
        console.log(`Data received for playlist ${id}:`, response.data);
        const formattedPlaylist = mapApiDataToPlaylistData(response.data.data);
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
 * Thêm một bài hát vào playlist cụ thể.
 */
export const addTrackToPlaylistAPI = async (playlistId: string | number, trackId: string | number): Promise<ApiResponse> => { /* ... giữ nguyên ... */
    console.log(`Frontend Service: Attempting to add track ${trackId} to playlist ${playlistId}`);
    try {
        const response = await axios.post<{ message?: string; error?: string; data?: any }>( `${API_BASE_URL_PLAYLISTS}/${playlistId}/tracks`, { trackId: Number(trackId) }, { withCredentials: true } );
        if (response.status === 200 || response.status === 201) { return { success: true, message: response.data?.message || "Thêm bài hát thành công.", data: response.data?.data }; }
        else { return { success: false, message: response.data?.message || "Phản hồi không mong đợi từ server." }; }
    } catch (error: any) { /* ... error handling ... */ console.error(`Error adding track ${trackId} to playlist ${playlistId} via API:`, error); let msg = "Lỗi không xác định"; if(error.response){ msg = error.response.data?.error || error.response.data?.message || `Lỗi server: ${error.response.status}`; } else if(error.request){ msg = "Không nhận được phản hồi.";} else { msg = error.message;} return { success: false, message: msg }; }
};

/**
 * Xóa một bài hát khỏi playlist cụ thể.
 */
export const removeTrackFromPlaylistAPI = async (playlistId: string | number, trackId: string | number): Promise<ApiResponse> => { /* ... giữ nguyên ... */
    console.log(`Frontend Service: Attempting to remove track ${trackId} from playlist ${playlistId}`);
    try {
        const response = await axios.delete<{ message?: string; error?: string }>( `${API_BASE_URL_PLAYLISTS}/${playlistId}/tracks/${trackId}`, { withCredentials: true } );
        if (response.status === 200 || response.status === 204) { return { success: true, message: response.data?.message || "Đã xóa bài hát khỏi playlist." }; }
        else { return { success: false, message: "Phản hồi không mong đợi từ server." }; }
    } catch (error: any) { /* ... error handling ... */ console.error(`Error removing track ${trackId} from playlist ${playlistId} via API:`, error); let msg = "Lỗi không xác định"; if(error.response){ msg = error.response.data?.error || error.response.data?.message || `Lỗi server: ${error.response.status}`; } else if(error.request){ msg = "Không nhận được phản hồi.";} else { msg = error.message;} return { success: false, message: msg }; }
};


// --- Export các hàm ---
// (Bạn cần đảm bảo file này chỉ export các hàm này hoặc gộp vào file service khác)

