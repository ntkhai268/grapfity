import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // backend base URL

// --- Interface User ---
// (Tùy chỉnh theo model backend trả về)
export interface UserData {
  id: number | string;
  userName: string;
  email: string;
  password : string;
  Name : string
  Avatar?: string | null;
  Birthday: string | Date | null;
  Address: string | null;
  PhoneNumber : string | null
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// --- Ánh xạ dữ liệu từ API về UserData frontend ---
export const mapApiDataToUserData = (raw: any): UserData => {
  return {
    id: raw.id || raw._id || 'unknown',
    userName: raw.userName || 'Unknown',
    email: raw.email || '',
    password: raw.password || '',
    Name: raw.Name || 'Unknown',
    Birthday: raw.Birthday || '',
    Address: raw.Address || '',
    PhoneNumber: raw.PhoneNumber || '',
    Avatar: raw.Avatar ? `${API_BASE_URL}/${raw.Avatar.replace(/^\/?/, '')}` : null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const getAllUsers = async (): Promise<UserData[]> => {
  const res = await axios.get<{ message: string; data: any[] }>(`${API_BASE_URL}/api/users`);
  return res.data.data.map(mapApiDataToUserData);
};


export const getUserById = async (id: number | string): Promise<UserData> => {
  const res = await axios.get<{ message: string; data: any }>(`${API_BASE_URL}/api/users/${id}`);
  return mapApiDataToUserData(res.data.data);
};

export const getMyProfile = async (): Promise<UserData> => {
  const res = await axios.get<{ message: string; data: any }>(`${API_BASE_URL}/api/users/me`, {
    withCredentials: true,
  });
  return mapApiDataToUserData(res.data.data);
};

export const updateUser = async (formData: FormData): Promise<{ message: string }> => {
  const res = await axios.put(`${API_BASE_URL}/api/users/me`, formData,{
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });
  return res.data;
};


export const deleteUser = async (): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_BASE_URL}/delete-user`, {
    withCredentials: true,
  });
  return res.data;
};