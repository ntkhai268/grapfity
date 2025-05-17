import axios from "axios";
const BACKEND_URL = 'http://localhost:8080';
export const getCurrentUser = async () => {
  try {
    console.log("🔥 Đã gọi getCurrentUser");

    const res = await axios.get(`${BACKEND_URL}/api/me`, {
      withCredentials: true, // 👈 BẮT BUỘC để gửi cookie JWT
    });
     console.log("✅ Kết quả:", res.data);
    return res.data; // { id, name, email }
    
  } catch (error: any) {
    console.error("Lỗi khi gọi /auth/me:", error?.response?.data || error.message);
    return null;
  }
};
