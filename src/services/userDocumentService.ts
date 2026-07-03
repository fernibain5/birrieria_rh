import { UserDocument, CreateUserDocumentData } from '../types/userDocument';
import { apiDelete, apiGet, apiUpload } from './apiClient';

const toUserDocument = (d: any): UserDocument => ({
  ...d,
  createdAt: d.createdAt ? new Date(d.createdAt) : null,
});

export const getUserDocuments = async (userId: string): Promise<UserDocument[]> => {
  const raw = await apiGet<any[]>(`/users/${userId}/documents`);
  return raw.map(toUserDocument);
};

export const uploadUserDocument = async ({
  userId,
  fileName,
  file,
  uploadedBy,
}: CreateUserDocumentData): Promise<UserDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName.trim());
  formData.append('uploadedBy', uploadedBy);

  const raw = await apiUpload<any>(`/users/${userId}/documents`, formData);
  return toUserDocument(raw);
};

export const deleteUserDocument = async (document: UserDocument): Promise<void> => {
  await apiDelete(`/users/${document.userId}/documents/${document.id}`);
};
