import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { FileText, Loader2 } from "lucide-react";
import { getFileExtension } from "./fileHelpers";

interface SpreadsheetPreviewProps {
  fileUrl: string;
  originalName: string;
}

const SpreadsheetPreview: React.FC<SpreadsheetPreviewProps> = ({ fileUrl, originalName }) => {
  const [rows, setRows] = useState<string[][]>([]);
  const [sheetName, setSheetName] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let canceled = false;

    const renderSpreadsheet = async () => {
      try {
        setLoading(true);
        setFailed(false);

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Spreadsheet preview failed with status ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          throw new Error("Spreadsheet has no sheets");
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const previewRows = XLSX.utils
          .sheet_to_json<string[]>(worksheet, {
            blankrows: false,
            defval: "",
            header: 1,
            raw: false,
          })
          .slice(0, 16)
          .map((row) => row.slice(0, 8).map((cell) => String(cell)));

        if (!canceled) {
          setSheetName(firstSheetName);
          setRows(previewRows);
        }
      } catch (error) {
        console.error("Error rendering spreadsheet preview:", error);
        if (!canceled) {
          setFailed(true);
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    renderSpreadsheet();

    return () => {
      canceled = true;
    };
  }, [fileUrl]);

  if (failed || (!loading && rows.length === 0)) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <FileText size={42} className="text-brand-secondary" />
        <span className="mt-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
          {getFileExtension(originalName)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-white">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-brand-secondary" size={28} />
        </div>
      )}

      <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-600">
        {sheetName || "Hoja 1"}
      </div>
      <div className="overflow-hidden">
        <table className="w-full table-fixed border-collapse text-[10px] leading-tight text-gray-700">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`h-7 truncate border border-gray-200 px-2 ${rowIndex === 0
                        ? "bg-brand-secondarySoft font-semibold text-brand-primary"
                        : ""
                      }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpreadsheetPreview;
