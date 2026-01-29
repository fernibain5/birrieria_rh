import React from "react";
import { FileText, Eye } from "lucide-react";
import { Document } from "../../types/documents";

interface DocumentCardProps {
  document: Document;
  onPreview: (document: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onPreview }) => {
  const getPreviewText = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <FileText className="text-green-600 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {document.title}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium mr-2">
                  {document.fileType.toUpperCase()}
                </span>
                <span>Sucursal {document.sucursal}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {getPreviewText(document.content)}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onPreview(document)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            <Eye size={16} className="mr-2" />
            Ver Documento
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
