import React, { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { FileText, Loader2 } from "lucide-react";

interface DocxPreviewProps {
  fileUrl: string;
}

const DocxPreview: React.FC<DocxPreviewProps> = ({ fileUrl }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const documentRef = useRef<HTMLDivElement | null>(null);
  const styleRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [scale, setScale] = useState(0.38);

  useEffect(() => {
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
          breakPages: false,
          className: "docx-card-preview",
          ignoreFonts: true,
          inWrapper: false,
          renderChanges: false,
          renderComments: false,
          renderEndnotes: false,
          renderFooters: false,
          renderFootnotes: false,
          renderHeaders: false,
        });

        const page = documentRef.current.querySelector(".docx") as HTMLElement | null;
        const containerWidth = containerRef.current?.clientWidth || 320;
        const pageWidth = page?.scrollWidth || 816;
        setScale(Math.min(containerWidth / pageWidth, 0.65));
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
  }, [fileUrl]);

  if (failed) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <FileText size={42} className="text-brand-secondary" />
        <span className="mt-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
          DOCX
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full overflow-hidden bg-white">
      <div ref={styleRef} />
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-brand-secondary" size={28} />
        </div>
      )}
      <div
        ref={documentRef}
        className="origin-top-left text-gray-900"
        style={{
          transform: `scale(${scale})`,
          width: `${100 / scale}%`,
        }}
      />
    </div>
  );
};

export default DocxPreview;
