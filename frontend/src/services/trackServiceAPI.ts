// D:\web_html\gop\grapfity\frontend\src\services\trackServiceAPI.ts
import axios from 'axios';
// Có thể bạn cần import thêm các kiểu dữ liệu hoặc interface từ nơi khác nếu cần

// API Base URL for Tracks
const API_BASE_URL = 'http://localhost:8080/api/tracks'; // Trỏ tới /api/tracks

// --- Định nghĩa cấu trúc dữ liệu Track cho Frontend ---
// (Bạn có thể điều chỉnh các trường này cho phù hợp với Model Track thực tế của bạn)
export interface TrackUploader {
    username: string;
    // Thêm các trường khác của User nếu cần hiển thị
}

export interface TrackData {
    id: number | string;
    title: string; // Giả định có trường title dựa trên playlistService
    src: string;   // Ánh xạ từ trackUrl
    cover: string; // Ánh xạ từ imageUrl
    artist?: string; // Tên nghệ sĩ (lấy từ uploader)
    uploaderId?: number | string; // ID người tải lên
    uploader?: TrackUploader; // Thông tin chi tiết người tải lên (nếu có)
    createdAt?: string | Date;
    updatedAt?: string | Date;
    // Thêm các trường khác nếu cần (ví dụ: duration, genre,...)
}

// --- Hàm tiện ích ánh xạ dữ liệu ---
/**
 * Ánh xạ dữ liệu Track thô từ API thành cấu trúc TrackData của Frontend.
 * @param trackFromApi Dữ liệu track thô từ backend.
 * @returns Đối tượng TrackData đã được định dạng.
 */
const mapApiDataToTrackData = (trackFromApi: any): TrackData => {
    // Kiểm tra xem thông tin User (uploader) có được include không
    const uploaderInfo = trackFromApi.User ? { username: trackFromApi.User.username || "Unknown Artist" } : undefined;

    // --- THAY ĐỔI LOGIC LẤY TITLE Ở ĐÂY ---
    // Ưu tiên lấy từ Metadata.trackname, nếu không có thì mặc định là "Unknown Title"
    // Giả định Metadata được lồng trong key 'Metadata' (hoặc tên association bạn đặt)
    const title = trackFromApi.Metadata?.trackname || "Unknown Title"; // Sử dụng optional chaining (?.)

    return {
        id: trackFromApi.id,
        // Sử dụng biến title đã xử lý ở trên
        title: title,
        src: trackFromApi.trackUrl || "",
        cover: trackFromApi.imageUrl || "/assets/default_track_cover.png",
        artist: uploaderInfo?.username, // Giữ nguyên logic lấy artist
        uploaderId: trackFromApi.uploaderId,
        uploader: uploaderInfo,
        createdAt: trackFromApi.createdAt,
        updatedAt: trackFromApi.updatedAt,
        // Bạn cũng có thể thêm các trường metadata khác vào TrackData nếu cần hiển thị
        // duration: trackFromApi.Metadata?.duration_ms,
        // explicit: trackFromApi.Metadata?.explicit,
    };
};

// --- Các hàm gọi API ---

/**
 * Lấy tất cả các tracks.
 */
export const getAllTracksAPI = async (): Promise<TrackData[]> => {
    console.log("Attempting to fetch all tracks...");
    try {
        const response = await axios.get<{ message: string; data: any[] }>(`${API_BASE_URL}/`);
        console.log("Fetched all tracks data (raw):", response.data);
        // Backend trả về mảng data trong { message, data }
        const rawTracks = response.data.data || []; // Lấy mảng data từ response
        const tracks = rawTracks.map(mapApiDataToTrackData);
        console.log("Formatted all tracks data:", tracks);
        return tracks;

    } catch (error) { // error là 'unknown'
        console.error('Error fetching all tracks:', error);
        // Sao chép logic xử lý lỗi chi tiết từ playlistService.ts nếu cần
        if (error && typeof error === 'object' && 'response' in error) {
             const axiosError = error as any;
             console.error('Server response status:', axiosError.response?.status);
             console.error('Server response data:', axiosError.response?.data);
        } else if (error && typeof error === 'object' && 'request' in error) {
             const axiosError = error as any;
             console.error('No response received:', axiosError.request);
        } else if (error instanceof Error) {
             console.error('Generic error:', error.message);
        } else {
             console.error('Unknown error occurred:', error);
        }
        throw error; // Ném lại lỗi để component gọi xử lý (ví dụ: hiển thị thông báo)
    }
};

/**
 * Lấy chi tiết một track bằng ID (không kèm uploader chi tiết).
 */
export const getTrackByIdAPI = async (id: string | number): Promise<TrackData | null> => {
    console.log(`Workspaceing track details for ID: ${id}`);
    try {
        // Backend trả về { message, data }
        const response = await axios.get<{ message: string; data: any }>(`${API_BASE_URL}/${id}`);
        console.log(`Data received for track ${id} (raw):`, response.data);

        if (!response.data.data) { // Kiểm tra xem có data trả về không
             console.log(`Track with ID ${id} not found (data is null/undefined).`);
             return null;
        }

        const formattedTrack = mapApiDataToTrackData(response.data.data);
        console.log(`Formatted track data for ${id}:`, formattedTrack);
        return formattedTrack;

    } catch (error) { // error là 'unknown'
        console.error(`Error fetching track with id ${id}:`, error);
        if (error && typeof error === 'object' && 'response' in error) {
             const axiosError = error as any;
             console.error('Server response status:', axiosError.response?.status);
             console.error('Server response data:', axiosError.response?.data);
             if (axiosError.response?.status === 404) {
                 console.log(`Track with ID ${id} not found (404).`);
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
 * Lấy chi tiết một track bằng ID, KÈM THEO thông tin người tải lên (uploader).
 * Giả định backend có một endpoint hoặc logic để include thông tin User.
 * Có thể endpoint vẫn là /:id nhưng controller gọi service khác.
 */
export const getTrackWithUploaderByIdAPI = async (id: string | number): Promise<TrackData | null> => {
    console.log(`Workspaceing track details WITH UPLOADER for ID: ${id}`);
    try {
        // Giả định endpoint giống getTrackById nhưng controller xử lý khác
        // Hoặc nếu backend có endpoint riêng (ví dụ: /api/tracks/details/:id), hãy thay đổi URL ở đây
        const response = await axios.get<{ message: string; data: any }>(`${API_BASE_URL}/uploader/${id}`); // *** LƯU Ý ENDPOINT NÀY ***
        // const response = await axios.get<{ message: string; data: any }>(`${API_BASE_URL}/${id}?include=uploader`); // Hoặc dùng query param nếu backend hỗ trợ

        console.log(`Data received for track ${id} with uploader (raw):`, response.data);

        if (!response.data.data) {
            console.log(`Track with ID ${id} (with uploader) not found (data is null/undefined).`);
            return null;
        }

        // mapApiDataToTrackData đã xử lý việc lấy User từ response.data.data.User
        const formattedTrack = mapApiDataToTrackData(response.data.data);
        console.log(`Formatted track data with uploader for ${id}:`, formattedTrack);
        return formattedTrack;

    } catch (error) { // error là 'unknown'
        console.error(`Error fetching track with uploader for id ${id}:`, error);
        // Copy và điều chỉnh logic xử lý lỗi tương tự getTrackByIdAPI
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Server response status:', axiosError.response?.status);
            console.error('Server response data:', axiosError.response?.data);
            if (axiosError.response?.status === 404) {
                console.log(`Track with ID ${id} (with uploader) not found (404).`);
                return null;
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
 * Tạo một track mới (Upload thông tin track lên server).
 * Cần thông tin xác thực người dùng.
 * @param trackUrl URL của file nhạc (đã upload lên đâu đó, vd: cloud storage)
 * @param imageUrl URL của ảnh bìa (đã upload)
 * @param uploaderId ID của người dùng đang thực hiện upload (lấy từ state/context)
 * @param title Tiêu đề bài hát (nếu có)
 */
export const createTrackAPI = async (
    trackUrl: string,
    imageUrl: string,
    uploaderId: string | number,
    title?: string // Thêm title nếu model Track có
): Promise<TrackData> => {
    console.log(`Attempting to create track: ${title || trackUrl}`);
    try {
        const payload: any = { trackUrl, imageUrl, uploaderId };
        if (title) {
            payload.title = title; // Thêm title vào payload nếu được cung cấp
        }

        // Backend trả về { message, data: newTrack }
        const response = await axios.post<{ message: string; data: any }>(
            `${API_BASE_URL}/`,
            payload,
            { withCredentials: true } // Gửi thông tin xác thực
        );
        console.log("Track created successfully (raw data):", response.data);
        const newTrack = mapApiDataToTrackData(response.data.data);
        console.log("Formatted new track data:", newTrack);
        return newTrack;

    } catch (error) { // error là 'unknown'
        console.error("Error creating track via API:", error);
        // Xử lý lỗi chi tiết (400 Bad Request, 401 Unauthorized, etc.)
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Server response status:', axiosError.response?.status);
            console.error('Server response data:', axiosError.response?.data);
            const status = axiosError.response?.status;
            const errorMessage = axiosError.response?.data?.message || "Could not create track.";
            if (status === 400) {
                 throw new Error(`Dữ liệu không hợp lệ: ${errorMessage}`);
            } else if (status === 401 || status === 403) {
                 throw new Error('Bạn không có quyền tạo track. Vui lòng đăng nhập.');
            } else {
                 throw new Error(`Lỗi không xác định từ server: ${errorMessage}`);
            }
        } else if (error && typeof error === 'object' && 'request' in error) {
            throw new Error("Không nhận được phản hồi từ server.");
        } else if (error instanceof Error) {
            throw new Error(`Lỗi khi tạo track: ${error.message}`);
        } else {
            throw new Error("Lỗi không xác định khi tạo track.");
        }
    }
};


/**
 * Cập nhật thông tin một track.
 * Cần thông tin xác thực và quyền sở hữu track.
 * @param id ID của track cần cập nhật
 * @param updateData Đối tượng chứa các trường cần cập nhật (vd: { title, trackUrl, imageUrl })
 * LƯU Ý: Backend controller hiện tại yêu cầu gửi cả id, trackUrl, imageUrl, uploaderId trong body.
 */
export const updateTrackAPI = async (
    id: string | number,
    updateData: { title?: string; trackUrl: string; imageUrl: string; uploaderId: string | number } // Phải khớp với backend controller
): Promise<TrackData> => {
    console.log(`Attempting to update track ID: ${id}`);
    try {
        // Backend controller `updateTrackController` lấy id, trackUrl, imageUrl, uploaderId từ req.body
        const payload = {
            id: id, // Gửi cả ID trong body theo yêu cầu của controller
            title: updateData.title, // Gửi title nếu có
            trackUrl: updateData.trackUrl,
            imageUrl: updateData.imageUrl,
            uploaderId: updateData.uploaderId // Backend yêu cầu cả uploaderId
        };

        // Backend trả về { message, data: updatedTrack }
        const response = await axios.put<{ message: string; data: any }>(
            `${API_BASE_URL}/${id}`, // ID cũng nằm trong URL
            payload,
            { withCredentials: true } // Gửi thông tin xác thực
        );
        console.log("Track updated successfully (raw data):", response.data);
        const updatedTrack = mapApiDataToTrackData(response.data.data);
        console.log("Formatted updated track data:", updatedTrack);
        return updatedTrack;

    } catch (error) { // error là 'unknown'
        console.error(`Error updating track ID ${id}:`, error);
        // Xử lý lỗi chi tiết (400, 401/403, 404 Not Found)
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('Server response status:', axiosError.response?.status);
            console.error('Server response data:', axiosError.response?.data);
            const status = axiosError.response?.status;
            const errorMessage = axiosError.response?.data?.message || "Could not update track.";
            if (status === 400) {
                 throw new Error(`Dữ liệu cập nhật không hợp lệ: ${errorMessage}`);
            } else if (status === 401 || status === 403) {
                 throw new Error('Bạn không có quyền cập nhật track này.');
            } else if (status === 404) {
                 throw new Error('Track không tồn tại để cập nhật.');
            } else {
                 throw new Error(`Lỗi không xác định từ server: ${errorMessage}`);
            }
        } else if (error && typeof error === 'object' && 'request' in error) {
             throw new Error("Không nhận được phản hồi từ server.");
        } else if (error instanceof Error) {
             throw new Error(`Lỗi khi cập nhật track: ${error.message}`);
        } else {
             throw new Error("Lỗi không xác định khi cập nhật track.");
        }
    }
};

/**
 * Xóa một track.
 * Cần thông tin xác thực và quyền sở hữu track.
 * LƯU Ý: Backend logic cho delete đang là TODO. Hàm này có thể chưa hoạt động đúng.
 */
export const deleteTrackAPI = async (id: string | number): Promise<{ success: boolean; message: string }> => {
    console.log(`Attempting to delete track ID: ${id}`);
    try {
        // Giả định backend trả về { message: '...' } khi thành công
        const response = await axios.delete<{ message: string }>(
            `${API_BASE_URL}/${id}`,
            { withCredentials: true } // Gửi thông tin xác thực
        );

        console.log("Track delete request successful:", response.data);
        // Kiểm tra status 200 OK và có message trả về
        if (response.status === 200 && response.data.message) {
             return { success: true, message: response.data.message };
        } else {
             // Trường hợp backend trả về 2xx nhưng không đúng format mong đợi
             console.warn("Unexpected successful response structure after delete:", response);
             return { success: false, message: "Phản hồi xóa track không như mong đợi." };
        }

    } catch (error: any) { // Bắt lỗi dạng 'any'
        console.error(`Error deleting track ID ${id}:`, error);
        let errorMessage = "Lỗi không xác định khi xóa track.";

        if (error && error.response) {
             const axiosResponseError = error as { response: { status: number; data: any } };
             console.error('Server Response Error:', {
                 status: axiosResponseError.response.status,
                 data: axiosResponseError.response.data
             });
             const responseData = axiosResponseError.response.data;
             errorMessage = responseData?.message || responseData?.error || `Lỗi từ server: ${axiosResponseError.response.status}`;
             const status = axiosResponseError.response.status;

             if (status === 401 || status === 403) {
                 errorMessage = "Bạn không có quyền xóa track này.";
             } else if (status === 404) {
                 errorMessage = "Track không tồn tại để xóa.";
             } else if (status === 501 || status === 500) { // Có thể backend trả về 501 Not Implemented
                console.warn("Backend might not have implemented delete functionality yet.");
                errorMessage = responseData?.message || "Chức năng xóa track có thể chưa được hoàn thiện ở backend.";
             }
             // Thêm các case khác nếu cần

        } else if (error && error.request) {
            errorMessage = "Không nhận được phản hồi từ server khi xóa track.";
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        // Trả về thất bại để component xử lý
        return { success: false, message: errorMessage };
    }
};

export const addTrackToPlaylistAPI = async (playlistId: string | number, trackId: string | number): Promise<{ success: boolean; message: string }> => {
    console.log(`Frontend Service: Attempting to add track ${trackId} to playlist ${playlistId}`);
    try {
        // Giả định route là POST /api/playlists/:playlistId/tracks
        // --> Đảm bảo route này đúng với backend của bạn <--
        const response = await axios.post<{ message: string; data: any }>( // data là PlaylistTrack object
            `${API_BASE_URL}/${playlistId}/tracks`, // Endpoint
            { trackId: Number(trackId) },        // Body chứa trackId dạng số
            { withCredentials: true }          // Gửi cookie xác thực
        );

        console.log("Backend response after adding track:", response.data);

        // Backend hiện tại trả về 200 OK khi thành công
        if (response.status === 200 && response.data.message) {
            console.log(`Successfully added track ${trackId} to playlist ${playlistId}. Message: ${response.data.message}`);
            // Trả về thành công, component gọi hàm này sẽ cần fetch lại dữ liệu playlist
            return { success: true, message: response.data.message };
        } else {
            // Trường hợp không mong muốn khác
            console.warn("Unexpected successful response structure:", response);
            // Không nên throw Error ở đây nếu kiểu trả về là Promise<{success, message}>
            // throw new Error("Phản hồi từ server không như mong đợi sau khi thêm bài hát.");
             return { success: false, message: "Phản hồi từ server không như mong đợi sau khi thêm bài hát." };
        }

    } catch (error: any) { // Bắt lỗi dưới dạng 'any'
        console.error(`Error adding track ${trackId} to playlist ${playlistId} via API:`, error);

        let errorMessage = "Lỗi không xác định khi thêm bài hát vào playlist.";

        // Kiểm tra trực tiếp cấu trúc lỗi thay vì dùng isAxiosError
        if (error && error.response) {
            // Có phản hồi lỗi từ server (status code 4xx, 5xx)
            const axiosResponseError = error as { response: { status: number; data: any } }; // Type assertion đơn giản
             console.error('Server Response Error:', {
                 status: axiosResponseError.response.status,
                 data: axiosResponseError.response.data
             });
            const responseData = axiosResponseError.response.data;
            // Ưu tiên lấy lỗi từ responseData.error hoặc responseData.message
            errorMessage = responseData?.error || responseData?.message || `Lỗi từ server: ${axiosResponseError.response.status}`;

            const status = axiosResponseError.response.status;
            if (status === 400) {
                console.warn(`Bad Request (400): ${errorMessage}`);
            } else if (status === 401 || status === 403) {
                console.warn(`Authentication/Authorization Error (${status}).`);
                errorMessage = "Bạn không được phép thực hiện hành động này.";
            } else if (status === 404) {
                console.warn(`Not Found (404): ${errorMessage}`);
                // Cập nhật message nếu backend trả về cụ thể hơn
                if (errorMessage.toLowerCase().includes('playlist')) {
                     errorMessage = "Không tìm thấy playlist.";
                } else if (errorMessage.toLowerCase().includes('track') || errorMessage.toLowerCase().includes('bài hát')) {
                     errorMessage = "Không tìm thấy bài hát.";
                } else {
                      errorMessage = "Không tìm thấy tài nguyên được yêu cầu.";
                }
            } else if (status === 409) {
                 console.warn(`Conflict (409): ${errorMessage}`); // Ví dụ: Bài hát đã tồn tại
                 errorMessage = responseData?.message || "Bài hát này đã có trong playlist.";
            }
            // Bạn có thể thêm các case khác cho các status code cụ thể

        } else if (error && error.request) {
            // Request đã được gửi đi nhưng không nhận được phản hồi
             console.error('No response received (Network Error):', error.request);
            errorMessage = "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.";
        } else if (error instanceof Error) {
            // Lỗi Javascript thông thường (ví dụ: lỗi trong logic trước khi gọi axios)
             console.error('Generic JavaScript error:', error.message);
             errorMessage = error.message; // Lấy message từ lỗi JS
         } else {
            // Các loại lỗi không xác định khác
             console.error('Unknown error occurred:', error);
             // Có thể cố gắng chuyển đổi error sang string để xem thông tin
             try {
                errorMessage = String(error);
             } catch (e) { /* Bỏ qua nếu không thể chuyển đổi */ }
        }

        // Trả về trạng thái thất bại để component xử lý
        return { success: false, message: errorMessage };
    }
};

export const removeTrackFromPlaylistAPI = async (playlistId: string | number, trackId: string | number): Promise<{ success: boolean; message: string }> => {
    console.log(`Frontend Service: Attempting to remove track ${trackId} from playlist ${playlistId}`);
    try {
        // Gọi API backend với phương thức DELETE
        // Endpoint: DELETE /api/playlists/:playlistId/tracks/:trackId
        const response = await axios.delete<{ message: string }>( // Backend có thể chỉ trả về message
            `${API_BASE_URL}/${playlistId}/tracks/${trackId}`, // URL bao gồm cả trackId
            { withCredentials: true } // Gửi cookie xác thực
        );

        console.log("Backend response after removing track:", response.data);

        // Giả định thành công nếu status là 200 hoặc 204 (No Content) và có message (nếu status là 200)
        if ((response.status === 200 && response.data.message) || response.status === 204) {
            console.log(`Successfully removed track ${trackId} from playlist ${playlistId}.`);
            return { success: true, message: response.data?.message || "Đã xóa bài hát khỏi playlist." }; // Lấy message nếu có
        } else {
            console.warn("Unexpected successful response structure after delete:", response);
            return { success: false, message: "Phản hồi từ server không như mong đợi." };
        }

    } catch (error: any) {
        console.error(`Error removing track ${trackId} from playlist ${playlistId} via API:`, error);
        let errorMessage = "Lỗi không xác định khi xóa bài hát.";
        if (error.response) {
            const status = error.response.status;
            const responseData = error.response.data;
            errorMessage = responseData?.error || `Lỗi từ server: ${status}`;
            console.error('Server Response Error:', { status, data: responseData });
            // Xử lý các status code cụ thể
            if (status === 401 || status === 403) errorMessage = "Bạn không có quyền xóa khỏi playlist này.";
            else if (status === 404) errorMessage = responseData?.error || "Không tìm thấy playlist hoặc bài hát trong playlist.";
            else if (status === 400) errorMessage = responseData?.error || "Dữ liệu không hợp lệ.";
        } else if (error.request) {
            errorMessage = "Không nhận được phản hồi từ server.";
        } else {
            errorMessage = `Lỗi không xác định: ${error.message}`;
        }
        // Trả về thất bại kèm message lỗi
        return { success: false, message: errorMessage };
    }
};


// --- Các hàm API khác liên quan đến Track (nếu có) ---
// Ví dụ: tìm kiếm track, lấy track theo artist,...