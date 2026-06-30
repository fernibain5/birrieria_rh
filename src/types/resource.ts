export interface Resource {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  storagePath: string;
  contentType: string;
  size: number;
  order: number;
  adminOnly: boolean;
  createdAt: Date | null;
  createdBy: string;
}

export interface CreateResourceData {
  fileName: string;
  file: File;
  createdBy: string;
  adminOnly: boolean;
}
