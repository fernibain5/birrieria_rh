export interface UserDocument {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  storagePath: string;
  contentType: string;
  size: number;
  createdAt: Date | null;
  uploadedBy: string;
}

export interface CreateUserDocumentData {
  userId: string;
  fileName: string;
  file: File;
  uploadedBy: string;
}
