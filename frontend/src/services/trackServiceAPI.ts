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
    cover: string | null; // Ánh xạ từ imageUrl
    artist?: string; // Tên nghệ sĩ (lấy từ uploader)
    uploaderId?: number | string; // ID người tải lên
    uploader?: TrackUploader; // Thông tin chi tiết người tải lên (nếu có)
    createdAt?: string | Date;
    updatedAt?: string | Date;
    lyrics?: string | null;
    duration_ms?: number;
    explicit?: boolean;
     privacy?: 'public' | 'private';
    
}

// --- Hàm tiện ích ánh xạ dữ liệu ---
/**
 * Ánh xạ dữ liệu Track thô từ API thành cấu trúc TrackData của Frontend.
 * @param trackFromApi Dữ liệu track thô từ backend.
 * @returns Đối tượng TrackData đã được định dạng.
 */
const BACKEND_URL = 'http://localhost:8080'; // hoặc import từ config

export const mapApiDataToTrackData = (trackFromApi: any): TrackData => {
  const uploaderInfo = trackFromApi.User
    ? { username: trackFromApi.User.Name || 'Unknown Artist' }
    : undefined;

  const title = trackFromApi.Metadatum?.trackname || 'Unknown Title';
  const lyrics = trackFromApi.Metadatum?.lyrics || null;
  
  const artist =
    uploaderInfo?.username ||
    trackFromApi.Metadatum?.artistName ||
    trackFromApi.artist ||
    null;

  // ✅ Chuẩn hóa đường dẫn ảnh và nhạc
  const relativeImageUrl = trackFromApi.imageUrl || null;
  const relativeAudioUrl = trackFromApi.trackUrl || null;

  const fullImageUrl = relativeImageUrl
    ? `${BACKEND_URL}/${relativeImageUrl.replace(/^\/?/, '')}`
    : null;

  const fullAudioUrl = relativeAudioUrl
    ? `${BACKEND_URL}/${relativeAudioUrl.replace(/^\/?/, '')}`
    : '';

  return {
    id: trackFromApi.id,
    title,
    src: fullAudioUrl,
    cover: fullImageUrl,
    artist: artist === 'Unknown Artist' ? null : artist,
    uploaderId: trackFromApi.uploaderId,
    uploader: uploaderInfo,
    createdAt: trackFromApi.createdAt,
    updatedAt: trackFromApi.updatedAt,
    lyrics,
    privacy: trackFromApi.privacy,
    
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
 * Lấy tất cả các bài hát do người dùng hiện tại tải lên.
 * Yêu cầu backend có endpoint /api/tracks/my-uploads và xác thực người dùng.
 */
export const getMyUploadedTracksAPI = async (): Promise<TrackData[]> => {
    console.log("[trackServiceAPI] Fetching tracks uploaded by current user...");
    try {
        // Gọi đến endpoint backend /api/tracks/my-uploads
        const response = await axios.get<{ message: string; data: any[] }>(
            (`${API_BASE_URL}/getmytracks`), // Endpoint đã định nghĩa trong router backend
            {
                withCredentials: true // Gửi cookie xác thực
            }
        );
        console.log("[trackServiceAPI] Raw data received for user's tracks:", response.data);
        
        const rawTracks = response.data?.data || [];
        // Map dữ liệu thô sang TrackData[]
        const formattedTracks = rawTracks.map(mapApiDataToTrackData);
        console.log("[trackServiceAPI] Formatted user's tracks data:", formattedTracks);
        return formattedTracks;

    } catch (error: any) { 
        console.error("[trackServiceAPI] Error fetching user's uploaded tracks:", error);
        if (error.response) {
            console.error('[trackServiceAPI] Server response status:', error.response.status);
            console.error('[trackServiceAPI] Server response data:', error.response.data);
            if (error.response.status === 401 || error.response.status === 403) {
                 throw new Error('Unauthorized: Bạn cần đăng nhập để xem danh sách này.'); 
            }
        }
        // Ném lại lỗi chung hoặc trả về mảng rỗng
        throw new Error("Không thể tải danh sách bài hát đã tải lên."); 
        // Hoặc: return []; 
    }
};

/**
 * Lấy các track công khai của một người dùng (dùng trong profile người khác).
 * @param userId ID của người dùng bị xem
 */
export const getPublicTracksOfUserAPI = async (userId: string | number): Promise<TrackData[]> => {
  console.log(`[trackServiceAPI] Fetching public tracks of user ID: ${userId}`);
  
  try {
    const response = await axios.get<{ message: string; data: any[] }>(
      `http://localhost:8080/api/tracks/user/${userId}`,
      {
        withCredentials: true
      }
    );

    const rawTracks = response.data?.data || [];
    const formattedTracks = rawTracks.map(mapApiDataToTrackData);

    console.log(`[trackServiceAPI] Formatted public tracks of user ${userId}:`, formattedTracks);
    return formattedTracks;

  } catch (error: any) {
    console.error(`[trackServiceAPI] Error fetching public tracks of user ${userId}:`, error);
    throw new Error("Không thể tải các bài hát công khai của người dùng này.");
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
  fileAudio: File,
  fileImage: File,
  title: string,
  privacy: string,
  lyrics: string,
  releaseDate: string
): Promise<TrackData> => {
  try {
    const formData = new FormData();
    formData.append('audio', fileAudio);
    formData.append('image', fileImage);
    formData.append('title', title);
    formData.append('privacy', privacy);
    formData.append('lyrics', lyrics);              // 👈 mới
    formData.append('releaseDate', releaseDate);    // 👈 mới

    // ✅ Gửi lên server
    const response = await fetch('http://localhost:8080/api/tracks/create-track', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Tạo track thất bại.');
    }

    const result = await response.json();
    return result.data;

  } catch (error: any) {
    console.error('[createTrackAPI] Lỗi tạo track:', error);
    throw new Error(error.message || 'Lỗi không xác định khi tạo track.');
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
  formData: FormData
): Promise<TrackData> => {
  const response = await axios.put(
    `${API_BASE_URL}/update-track/${id}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    }
  );
  const updatedTrack = mapApiDataToTrackData(response.data.data);
  return updatedTrack;
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


/**
 * Tải bài hát bằng trackId thông qua API /api/tracks/download/:trackId
 * Hàm này sẽ tự động mở hộp thoại "Lưu file" trong trình duyệt.
 * @param trackId ID của bài hát cần tải
 */
export const downloadTrackByIdAPI = (trackId: string | number) => {
  if (!trackId) {
    console.error("downloadTrackByIdAPI: trackId không hợp lệ.");
    return;
  }

  const downloadUrl = `${API_BASE_URL}/download/${trackId}`;

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.setAttribute("download", ""); // Gợi ý trình duyệt hiển thị hộp thoại lưu
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
// --- Các hàm API khác liên quan đến Track (nếu có) ---
// Ví dụ: tìm kiếm track, lấy track theo artist,...