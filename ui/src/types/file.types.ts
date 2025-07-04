export interface FileInfo {
  isDirectory: boolean;
  name: string;
  relativePath: string;
  size: string;
  creatingTime: string;
  isSelected?: boolean;
}

export interface StatusInfo<T = any> {
  isSuccess: boolean;
  msg: string;
  data?: T;
}

export interface DefaultPayloadModel<T = any> {
  isSuccess: boolean;
  msg: string;
  data: T;
}

export interface FileOperationRequest {
  paths: string[];
}

export interface CreateDirRequest {
  currentDir: string;
  name: string;
}

export interface RenameRequest extends FileOperationRequest {
  name: string;
}

export interface MoveRequest extends FileOperationRequest {
  moveDir: string;
  currentDir: string;
}

export interface ArchiveRequest extends FileOperationRequest {
  currentDir: string;
  name: string;
}

export interface FilesRequest {
  path: string;
}