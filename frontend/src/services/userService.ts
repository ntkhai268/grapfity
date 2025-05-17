// src/services/userService.ts
import axios from "axios";

export interface UserType {
  id: number;
  userName: string;
  email: string;
  roleId: number | null;
  Name: string | null;
  Birthday: string | null;
  Address: string | null;
  PhoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  userName: string;
  email: string;
  password: string;
  roleId: number;        // admin & user đều phải gửi
  Name?: string;
  Birthday?: string;     // ISO yyyy-MM-dd
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
}

const BASE_API = "http://localhost:8080/api";
const REGISTER_API = `${BASE_API}/register`;
const USERS_API = `${BASE_API}/users`;

interface UsersResponse {
  message: string;
  data: UserType[];
}
interface UserResponse {
  message: string;
  data: UserType;
}

// Admin (GET)
export const fetchUsers = async (): Promise<UserType[]> => {
  const resp = await axios.get<UsersResponse>(USERS_API);
  return resp.data.data;
};

// Admin & end-user (POST /register)
export const createUser = async (
  payload: CreateUserPayload
): Promise<UserType> => {
  const resp = await axios.post<UserResponse>(REGISTER_API, payload);
  return resp.data.data;
};

// Admin (PUT)
export const updateUser = async (
  payload: UpdateUserPayload
): Promise<UserType> => {
  const { id, ...rest } = payload;
  const resp = await axios.put<UserResponse>(`${USERS_API}/${id}`, rest);
  return resp.data.data;
};

// Admin (DELETE)
export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${USERS_API}/${id}`);
};
