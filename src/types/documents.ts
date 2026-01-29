export interface Document {
  id: string;
  title: string;
  content: string;
  fileType: string;
  sucursal: string;
}

export interface DocumentPreview {
  id: string;
  title: string;
  preview: string;
  fileType: string;
} 