import axios from 'axios';
import { API_URL } from '../utils/config';
import type {
  FileInfo,
  StatusInfo,
  FilesRequest,
  CreateDirRequest,
  RenameRequest,
  MoveRequest,
  ArchiveRequest,
  FileOperationRequest,
} from '../types/file.types';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fileService = {
  getFiles: async (path: string): Promise<FileInfo[]> => {
    console.log('Requesting files for path:', path);
    const { data } = await api.post<FileInfo[]>('/file/files', { path });
    console.log('Received files:', data);
    return data;
  },

  createDirectory: async (request: CreateDirRequest): Promise<FileInfo[]> => {
    const { data } = await api.post<FileInfo[]>('/file/create-dir', request);
    return data;
  },

  deleteFiles: async (paths: string[]): Promise<StatusInfo<string>[]> => {
    const { data } = await api.post<StatusInfo<string>[]>('/file/delete-files', { paths });
    return data;
  },

  renameFiles: async (request: RenameRequest): Promise<StatusInfo<string>[]> => {
    const { data } = await api.post<StatusInfo<string>[]>('/file/rename-files', request);
    return data;
  },

  moveFiles: async (request: MoveRequest): Promise<FileInfo[]> => {
    const { data } = await api.post<FileInfo[]>('/file/move-files', request);
    return data;
  },

  archiveFiles: async (request: ArchiveRequest): Promise<FileInfo[]> => {
    const { data } = await api.post<FileInfo[]>('/file/archive-files', request);
    return data;
  },

  uploadFiles: async (
    files: File[], 
    dir: string, 
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<FileInfo[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file));
    formData.append('dir', dir);

    const { data } = await api.post<FileInfo[]>('/file/upload-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
      signal,
    });
    return data;
  },
};