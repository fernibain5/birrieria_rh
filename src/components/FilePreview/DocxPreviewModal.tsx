import React, { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { Download, FileText, Loader2, X } from "lucide-react";

interface DocxPreviewModalProps {
  isOpen: boolean;
  fileUrl: string;
  fileName: string;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const DocxPreviewModal: React.FC<DocxPreviewModalProps> = ({
  isOpen,
  fileUrl,
  fileName,
  onClose,
  onDownload,
  isDownloading,
}) => {
  const documentRef = useRef<HTMLDivElement | null>(null);
  const styleRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let canceled = false;

    const renderDocx = async () => {
      if (!documentRef.current || !styleRef.current) {
        return;
      }

      try {
        setLoading(true);
        setFailed(false);
        documentRef.current.innerHTML = "";
        styleRef.current.innerHTML = "";

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`DOCX preview failed with status ${response.status}`);
        }

        const blob = await response.blob();

        if (canceled || !documentRef.current || !styleRef.current) {
          return;
        }

        await renderAsync(blob, documentRef.current, styleRef.current, {
          breakPages: true,
          inWrapper: true,
          renderChanges: false,
          renderComments: false,
          renderEndnotes: true,
          renderFooters: true,
          renderFootnotes: true,
          renderHeaders: true,
        });
      } catch (error) {
        console.error("Error rendering DOCX preview:", error);
        if (!canceled) {
          setFailed(true);
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    renderDocx();

    return () => {
      canceled = true;
    };
  }, [isOpen, fileUrl]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center min-w-0">
            <FileText className="text-brand-secondary mr-3 shrink-0" size={28} />
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-800 truncate">{fileName}</h2>
              <span className="inline-block bg-brand-secondarySoft text-brand-primary px-2 py-1 rounded-full text-xs font-medium mt-1">
                DOCX
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="flex items-center px-3 py-2 text-brand-primary hover:bg-brand-secondarySoft rounded-md transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
              title="Descargar documento"
            >
              {isDownloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Cerrar"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto p-6 bg-gray-100">
          {loading && !failed && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
              <Loader2 className="animate-spin text-brand-secondary" size={32} />
            </div>
          )}

          {failed ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <FileText size={42} className="text-brand-secondary mb-3" />
              <p className="text-gray-700 mb-4">No se pudo generar la vista previa.</p>
              <button
                onClick={onDownload}
                disabled={isDownloading}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloading ? (
                  <Loader2 size={18} className="mr-2 animate-spin" />
                ) : (
                  <Download size={18} className="mr-2" />
                )}
                Descargar en su lugar
              </button>
            </div>
          ) : (
            <>
              <div ref={styleRef} />
              <div ref={documentRef} className="mx-auto w-fit text-gray-900" />
            </>
          )}
        </div>

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

export default DocxPreviewModal;
