import axios from 'axios';
import { API_URL } from '../utils/config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  isSuccess: boolean;
  msg: string;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: 'admin' | 'user';
      permissions: {
        canRead: boolean;
        canWrite: boolean;
        canDelete: boolean;
        canUpload: boolean;
        canDownload: boolean;
        canCreateFolder: boolean;
        canRename: boolean;
        canMove: boolean;
        canArchive: boolean;
        allowedPaths: string[];
        deniedPaths: string[];
      };
    };
  };
}

export interface SetupCheckResponse {
  isSuccess: boolean;
  msg: string;
  data: {
    hasUsers: boolean;
  };
}

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  checkSetup: async (): Promise<boolean> => {
    const { data } = await authApi.get<SetupCheckResponse>('/auth/check-setup');
    return data.data.hasUsers;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await authApi.post<AuthResponse>('/auth/signin', credentials);
    return data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const { data } = await authApi.post<AuthResponse>('/auth/signup', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await authApi.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  logoutAll: async (): Promise<void> => {
    await authApi.post('/auth/logout-all');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setAuthData: (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};