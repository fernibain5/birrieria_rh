import { File, FileImage, FileText } from "lucide-react";

export const formatFileSize = (bytes: number) => {
  if (!bytes) {
    return "Tamano no disponible";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** unitIndex;

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const getFileExtension = (fileName: string) => {
  const extension = fileName.split(".").pop();
  return extension && extension !== fileName ? extension.toUpperCase() : "FILE";
};

export const isWordFile = (originalName: string, contentType: string) => {
  const lowerName = originalName.toLowerCase();

  return (
    contentType.includes("word") ||
    contentType.includes("officedocument.wordprocessingml") ||
    lowerName.endsWith(".doc") ||
    lowerName.endsWith(".docx")
  );
};

export const isSpreadsheetFile = (originalName: string, contentType: string) => {
  const lowerName = originalName.toLowerCase();

  return (
    contentType.includes("spreadsheet") ||
    contentType.includes("excel") ||
    lowerName.endsWith(".xls") ||
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".csv")
  );
};

export const getFileIcon = (originalName: string, contentType: string) => {
  if (contentType.includes("image")) {
    return FileImage;
  }

  if (
    contentType.includes("pdf") ||
    isWordFile(originalName, contentType) ||
    isSpreadsheetFile(originalName, contentType)
  ) {
    return FileText;
  }

  return File;
};
