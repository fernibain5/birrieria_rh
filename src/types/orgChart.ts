export interface OrgChart {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  storagePath: string;
  contentType: string;
  size: number;
  createdAt: Date | null;
  createdBy: string;
}
