import React from "react";
import { X, FileText, Download } from "lucide-react";
import { Document } from "../../types/documents";

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !document) return null;

  const formatContent = (content: string) => {
    return content.split("\n").map((paragraph, index) => {
      if (paragraph.trim() === "") return null;

      // Check if it's a section header (ends with a colon and is short)
      const isHeader =
        paragraph.includes(":") &&
        paragraph.split(":")[1].trim() === "" &&
        paragraph.length < 100;

      if (isHeader) {
        return (
          <h3
            key={index}
            className="text-lg font-semibold text-green-700 mt-6 mb-3 border-b border-green-200 pb-2"
          >
            {paragraph.replace(":", "")}
          </h3>
        );
      }

      return (
        <p key={index} className="text-gray-700 mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="text-green-600 mr-3" size={28} />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {document.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium mr-2">
                  {document.fileType.toUpperCase()}
                </span>
                <span>Sucursal {document.sucursal}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                // Simulate download functionality
                const element = window.document.createElement("a");
                const file = new Blob([document.content], {
                  type: "text/plain",
                });
                element.href = URL.createObjectURL(file);
                element.download = `${document.title}.txt`;
                window.document.body.appendChild(element);
                element.click();
                window.document.body.removeChild(element);
              }}
              className="flex items-center px-3 py-2 text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200"
              title="Descargar documento"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose max-w-none">
            {formatContent(document.content)}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
