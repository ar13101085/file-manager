import axios from 'axios';
import { API_URL } from '../utils/config';
import type { User, CreateUserDto, UpdateUserDto, UserPermissions } from '../types/user.types';

interface ApiResponse<T> {
  isSuccess: boolean;
  msg: string;
  data: T;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get<ApiResponse<User[]>>('/admin/users');
    return data.data;
  },

  createUser: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post<ApiResponse<User>>('/admin/users', userData);
    return data.data;
  },

  updateUser: async (userId: string, userData: UpdateUserDto): Promise<User> => {
    const { data } = await api.put<ApiResponse<User>>(`/admin/users/${userId}`, userData);
    return data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  getPermissionsTemplate: async (): Promise<UserPermissions> => {
    const { data } = await api.get<ApiResponse<UserPermissions>>('/admin/permissions-template');
    return data.data;
  },
};