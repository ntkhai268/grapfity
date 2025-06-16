// src/services/userService.ts
import axios from "axios";

// =========================
// 📌 Interface
// =========================
export interface UserType {
  id: number;
  userName: string;
  email: string;
  roleId?: number;
  password?: string;
  Name?: string;
  Birthday?: string;
  Address?: string;
  PhoneNumber?: string;
  Avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  userName: string;
  email: string;
  password: string;
  roleId?: number;
  Name?: string;
  Birthday?: string;
  Address?: string;
  PhoneNumber?: string;
}

export interface UpdateUserPayload {
  id: number;
  userName?: string;
  email?: string;
  password?: string;
  roleId?: number;
  Name?: string;
  Birthday?: string;
  Address?: string;
  PhoneNumber?: string;
  Avatar?: string;
}

// =========================
// 📌 Base URLs
// =========================
const API_BASE_URL = "http://localhost:8080";
const USERS_API = `${API_BASE_URL}/api/users`;

// =========================
// 📌 Chuẩn hóa avatar URL
// =========================
export const normalizeUser = (user: UserType): UserType => ({
  ...user,
  Avatar: user.Avatar
    ? `${API_BASE_URL}/${user.Avatar.replace(/^\/?/, "")}`
    : null,
});

// =========================
// 📌 API functions
// =========================

// 📥 Lấy tất cả người dùng (admin)
export const fetchUsers = async (): Promise<UserType[]> => {
  const resp = await axios.get<{ message: string; data: UserType[] }>(USERS_API, {
    withCredentials: true,
  });
  return resp.data.data.map(normalizeUser);
};

// 📥 Lấy người dùng theo ID (admin)
export const getUserById = async (id: number | string): Promise<UserType> => {
  const resp = await axios.get<{ message: string; data: UserType }>(
    `${USERS_API}/${id}`
  );
  return normalizeUser(resp.data.data);
};

// 📥 Lấy profile người khác (dành cho FE khi xem người khác)
export const getUserByIdforUser = async (id: number | string): Promise<UserType> => {
  const resp = await axios.get<{ message: string; data: UserType }>(
    `${USERS_API}/profile/${id}`
  );
  return normalizeUser(resp.data.data);
};

// 📥 Lấy profile chính mình
export const getMyProfile = async (): Promise<UserType> => {
  const resp = await axios.get<{ message: string; data: UserType }>(
    `${USERS_API}/me`,
    { withCredentials: true }
  );
  return normalizeUser(resp.data.data);
};

// 🆕 Tạo người dùng
export const createUser = async (payload: CreateUserPayload): Promise<UserType> => {
  const resp = await axios.post<{ message: string; user: UserType }>(
    `${API_BASE_URL}/api/register`,
    payload
  );
  return normalizeUser(resp.data.user);
};

// 🛠 Cập nhật người dùng
export const updateUser = async (formData: FormData): Promise<{ message: string }> => {
  const res = await axios.put(`${USERS_API}/me`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return res.data;
};

// ❌ Xóa người dùng (chính mình hoặc bởi admin)
export const deleteUser = async (id?: number): Promise<{ message: string }> => {
  const url = id ? `${API_BASE_URL}/api/delete-user/${id}` : `${API_BASE_URL}/api/delete-user`;
  console.log("Deleting user at URL:", url);
  const resp = await axios.delete(url, {
    withCredentials: true,
  });
  return resp.data;
};

export const fetchUserId = async (): Promise<number | null> => {
  try {
    const user = await getMyProfile();
    return user.id;
  } catch (err) {
    console.error("Lỗi lấy userId:", err);
    return null;
  }
};