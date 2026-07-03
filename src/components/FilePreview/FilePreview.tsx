import React from "react";
import { getFileExtension, getFileIcon, isSpreadsheetFile, isWordFile } from "./fileHelpers";
import DocxPreview from "./DocxPreview";
import SpreadsheetPreview from "./SpreadsheetPreview";

interface FilePreviewProps {
  fileUrl: string;
  fileName: string;
  originalName: string;
  contentType: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  fileUrl,
  fileName,
  originalName,
  contentType,
}) => {
  const FileIcon = getFileIcon(originalName, contentType);

  if (contentType.includes("image")) {
    return (
      <img
        src={fileUrl}
        alt={fileName}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  if (contentType.includes("pdf")) {
    return (
      <iframe
        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        title={`Vista previa de ${fileName}`}
        className="h-full w-full border-0 bg-white pointer-events-none"
      />
    );
  }

  if (isWordFile(originalName, contentType)) {
    return <DocxPreview fileUrl={fileUrl} />;
  }

  if (isSpreadsheetFile(originalName, contentType)) {
    return <SpreadsheetPreview fileUrl={fileUrl} originalName={originalName} />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <FileIcon size={42} className="text-brand-secondary" />
      <span className="mt-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
        {getFileExtension(originalName)}
      </span>
    </div>
  );
};

export default FilePreview;
