import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  Check,
  File,
  FileImage,
  FileText,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteResource,
  getResources,
  reorderResources,
  uploadResource,
} from "../services/resourceService";
import { Resource } from "../types/resource";

type ResourceView = "general" | "admin";

const formatFileSize = (bytes: number) => {
  if (!bytes) {
    return "Tamano no disponible";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** unitIndex;

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const getResourceIcon = (resource: Resource) => {
  if (resource.contentType.includes("image")) {
    return FileImage;
  }

  if (
    resource.contentType.includes("pdf") ||
    isWordResource(resource) ||
    isSpreadsheetResource(resource)
  ) {
    return FileText;
  }

  return File;
};

const getCreatedDate = (resource: Resource) => {
  const date = resource.createdAt?.toDate?.();
  return date
    ? new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
    : "Fecha pendiente";
};

const getFileExtension = (fileName: string) => {
  const extension = fileName.split(".").pop();
  return extension && extension !== fileName ? extension.toUpperCase() : "FILE";
};

const isWordResource = (resource: Resource) => {
  const originalName = resource.originalName.toLowerCase();

  return (
    resource.contentType.includes("word") ||
    resource.contentType.includes("officedocument.wordprocessingml") ||
    originalName.endsWith(".doc") ||
    originalName.endsWith(".docx")
  );
};

const isSpreadsheetResource = (resource: Resource) => {
  const originalName = resource.originalName.toLowerCase();

  return (
    resource.contentType.includes("spreadsheet") ||
    resource.contentType.includes("excel") ||
    originalName.endsWith(".xls") ||
    originalName.endsWith(".xlsx") ||
    originalName.endsWith(".csv")
  );
};

const getResourceOrder = (resource: Resource) =>
  Number.isFinite(resource.order) && resource.order > 0
    ? resource.order
    : Number.MAX_SAFE_INTEGER;

const getVisibleResources = (
  resources: Resource[],
  isAdmin: boolean,
  activeView: ResourceView
) =>
  resources
    .filter((resource) =>
      isAdmin ? resource.adminOnly === (activeView === "admin") : !resource.adminOnly
    )
    .sort((resourceA, resourceB) => getResourceOrder(resourceA) - getResourceOrder(resourceB));

const DocxPreview: React.FC<{ resource: Resource }> = ({ resource }) => {
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

        const response = await fetch(resource.fileUrl);
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
  }, [resource.fileUrl]);

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

const SpreadsheetPreview: React.FC<{ resource: Resource }> = ({ resource }) => {
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

        const response = await fetch(resource.fileUrl);
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
  }, [resource.fileUrl]);

  if (failed || (!loading && rows.length === 0)) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <FileText size={42} className="text-brand-secondary" />
        <span className="mt-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
          {getFileExtension(resource.originalName)}
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
              <tr key={`${resource.id}-row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${resource.id}-cell-${rowIndex}-${cellIndex}`}
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

const ResourcePreview: React.FC<{ resource: Resource }> = ({ resource }) => {
  const ResourceIcon = getResourceIcon(resource);

  if (resource.contentType.includes("image")) {
    return (
      <img
        src={resource.fileUrl}
        alt={resource.fileName}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  if (resource.contentType.includes("pdf")) {
    return (
      <iframe
        src={`${resource.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        title={`Vista previa de ${resource.fileName}`}
        className="h-full w-full border-0 bg-white pointer-events-none"
      />
    );
  }

  if (isWordResource(resource)) {
    return <DocxPreview resource={resource} />;
  }

  if (isSpreadsheetResource(resource)) {
    return <SpreadsheetPreview resource={resource} />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <ResourceIcon size={42} className="text-brand-secondary" />
      <span className="mt-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
        {getFileExtension(resource.originalName)}
      </span>
    </div>
  );
};

const getErrorDetails = (error: unknown) => {
  const firebaseError = error as { code?: unknown; name?: unknown };

  return {
    code: firebaseError.code,
    message: error instanceof Error ? error.message : String(error),
    name: firebaseError.name,
  };
};

interface UploadDebugInfo {
  stage: string;
  currentUserUid?: string;
  error?: ReturnType<typeof getErrorDetails>;
  file?: {
    name: string;
    size: number;
    type: string;
  };
  isAdmin: boolean;
  resourceName: string;
  adminOnly: boolean;
  timestamp: string;
}

interface ResourceCardProps {
  isAdmin: boolean;
  isDeleting: boolean;
  isDownloading: boolean;
  onDelete: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  isAdmin,
  isDeleting,
  isDownloading,
  onDelete,
  onDownload,
  resource,
}) => {
  const ResourceIcon = getResourceIcon(resource);
  const isBusy = isDownloading || isDeleting;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: resource.id,
    disabled: !isAdmin || isBusy,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden bg-white rounded-lg shadow-sm border border-gray-100 transition-shadow ${isDragging ? "z-30 opacity-80 shadow-lg ring-2 ring-brand-secondary" : "hover:shadow-md"
        }`}
    >
      {isAdmin && (
        <button
          type="button"
          className="absolute left-3 top-3 z-20 flex h-10 w-10 cursor-grab items-center justify-center rounded-md bg-white/95 text-gray-500 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          title="Mover recurso"
          disabled={isBusy}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </button>
      )}

      <div className="p-5 pb-5">
        <div className={isAdmin ? "pl-11" : ""}>
          <div className="flex items-start gap-2">
            <ResourceIcon
              size={18}
              className="mt-1 shrink-0 text-brand-secondary"
            />
            <h2 className="text-lg font-semibold text-gray-900 break-words">
              {resource.fileName}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isBusy) {
              onDownload(resource);
            }
          }}
          disabled={isBusy}
          className="mt-4 block h-64 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50 text-left focus:outline-none focus:ring-2 focus:ring-brand-secondary disabled:cursor-not-allowed disabled:opacity-70 sm:h-72"
          title="Descargar recurso"
        >
          <ResourcePreview resource={resource} />
        </button>

        <p className="mt-4 pr-24 text-sm text-gray-500">
          {getCreatedDate(resource)}
        </p>
      </div>

      {(isDownloading || isDeleting) && (
        <div className="absolute inset-0 z-10 cursor-wait bg-white/40" />
      )}

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(resource)}
            disabled={isBusy}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-red-600 shadow-sm ring-1 ring-red-100 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Eliminar recurso"
          >
            {isDeleting ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <Trash2 size={22} />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => onDownload(resource)}
          disabled={isBusy}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-secondary text-white shadow-sm hover:bg-brand-secondaryHover focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          title="Descargar recurso"
        >
          {isDownloading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <Upload size={22} />
          )}
        </button>
      </div>
    </div>
  );
};

const RecursosPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adminOnly, setAdminOnly] = useState(false);
  const [activeView, setActiveView] = useState<ResourceView>("general");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploadDebugInfo, setUploadDebugInfo] = useState<UploadDebugInfo | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");
      const resourceList = await getResources();
      setResources(resourceList);
    } catch (error) {
      console.error("Error loading resources:", error);
      setError("Error al cargar los recursos. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file && !fileName.trim()) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setFileName(nameWithoutExtension);
    }
  };

  const resetForm = () => {
    setFileName("");
    setSelectedFile(null);
    setAdminOnly(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser || !isAdmin || !selectedFile || !fileName.trim()) {
      const blockedDebugInfo = {
        currentUserUid: currentUser?.uid,
        file: selectedFile
          ? {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type || "application/octet-stream",
          }
          : undefined,
        isAdmin,
        resourceName: fileName.trim(),
        adminOnly,
        stage: "blocked-before-upload",
        timestamp: new Date().toISOString(),
      };

      setUploadDebugInfo(blockedDebugInfo);
      console.error("[Resources] Upload blocked before calling Firebase", blockedDebugInfo);
      return;
    }

    const uploadContext = {
      currentUserUid: currentUser.uid,
      file: {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type || "application/octet-stream",
      },
      isAdmin,
      resourceName: fileName.trim(),
      adminOnly,
      timestamp: new Date().toISOString(),
    };

    try {
      setUploading(true);
      setError("");
      setUploadDebugInfo({
        ...uploadContext,
        stage: "upload-started",
      });
      console.error("[Resources] Upload submit reached Firebase call", uploadContext);
      await uploadResource({
        fileName,
        file: selectedFile,
        createdBy: currentUser.uid,
        adminOnly,
      });
      setActiveView(adminOnly ? "admin" : "general");
      resetForm();
      await loadResources();
    } catch (error) {
      const errorDetails = getErrorDetails(error);
      const failedDebugInfo = {
        ...uploadContext,
        error: errorDetails,
        stage: "upload-failed",
      };

      setUploadDebugInfo(failedDebugInfo);
      console.error(
        "[Resources] Upload failed in page handler",
        failedDebugInfo,
        error
      );
      setError("Error al subir el recurso. Verifica el archivo e intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      setDownloadingId(resource.id);
      setError("");

      const response = await fetch(resource.fileUrl);
      if (!response.ok) {
        throw new Error(`Download request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = resource.originalName || resource.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch (error) {
      console.error("Error forcing resource download:", error);
      window.open(resource.fileUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (resource: Resource) => {
    const confirmed = window.confirm(`Eliminar "${resource.fileName}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(resource.id);
      setError("");
      await deleteResource(resource);
      const visibleResources = getVisibleResources(resources, isAdmin, activeView);
      const remainingVisibleResources = visibleResources
        .filter((currentResource) => currentResource.id !== resource.id)
        .map((currentResource, index) => ({
          ...currentResource,
          order: index + 1,
        }));

      setResources((currentResources) =>
        currentResources
          .filter((currentResource) => currentResource.id !== resource.id)
          .map((currentResource) => {
            const updatedResource = remainingVisibleResources.find(
              (remainingResource) => remainingResource.id === currentResource.id
            );

            return updatedResource || currentResource;
          })
      );
      await reorderResources(remainingVisibleResources);
    } catch (error) {
      console.error("Error deleting resource:", error);
      setError("Error al eliminar el recurso. Por favor, intenta nuevamente.");
      await loadResources();
    } finally {
      setDeletingId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!isAdmin || !over || active.id === over.id) {
      return;
    }

    const visibleResources = getVisibleResources(resources, isAdmin, activeView);
    const oldIndex = visibleResources.findIndex((resource) => resource.id === active.id);
    const newIndex = visibleResources.findIndex((resource) => resource.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedVisibleResources = arrayMove(visibleResources, oldIndex, newIndex).map(
      (resource, index) => ({
        ...resource,
        order: index + 1,
      })
    );

    setResources((currentResources) =>
      currentResources.map((currentResource) => {
        const updatedResource = reorderedVisibleResources.find(
          (resource) => resource.id === currentResource.id
        );

        return updatedResource || currentResource;
      })
    );

    try {
      setError("");
      await reorderResources(reorderedVisibleResources);
    } catch (error) {
      console.error("Error reordering resources:", error);
      setError("Error al guardar el nuevo orden. Por favor, intenta nuevamente.");
      await loadResources();
    }
  };

  const visibleResources = getVisibleResources(resources, isAdmin, activeView);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <UploadCloud className="text-brand-secondary mr-4" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recursos</h1>
              <p className="text-gray-600 mt-1">
                Archivos compartidos para consulta del equipo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <div className="flex items-center">
              <AlertCircle size={18} className="mr-2 shrink-0" />
              <span>{error}</span>
            </div>
            {uploadDebugInfo && (
              <details className="mt-3 text-xs text-red-900">
                <summary className="cursor-pointer font-semibold">Detalles tecnicos</summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-white/70 p-3 font-mono">
                  {JSON.stringify(uploadDebugInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {isAdmin && (
          <form onSubmit={handleUpload} className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="resourceName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre del recurso
                  </label>
                  <input
                    id="resourceName"
                    type="text"
                    value={fileName}
                    onChange={(event) => setFileName(event.target.value)}
                    className="input"
                    placeholder="Ej. Manual de procedimientos"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="resourceFile"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Archivo
                  </label>
                  <input
                    ref={fileInputRef}
                    id="resourceFile"
                    type="file"
                    onChange={handleFileChange}
                    className="input"
                    disabled={uploading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || !fileName.trim() || uploading}
                className="btn btn-primary self-end h-10"
              >
                {uploading ? (
                  <Loader2 size={18} className="mr-2 animate-spin" />
                ) : (
                  <Plus size={18} className="mr-2" />
                )}
                {uploading ? "Subiendo..." : "Agregar"}
              </button>
            </div>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={adminOnly}
                onChange={(event) => setAdminOnly(event.target.checked)}
                disabled={uploading}
                className="sr-only"
              />
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${adminOnly
                    ? "border-brand-secondary bg-brand-secondary text-white"
                    : "border-gray-300 bg-white"
                  }`}
              >
                {adminOnly && <Check size={14} />}
              </span>
              <span>Solo visible para administradores</span>
            </label>

            {selectedFile && (
              <p className="mt-3 text-sm text-gray-500">
                Seleccionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </form>
        )}

        {isAdmin && (
          <div className="mb-6 inline-flex rounded-md border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveView("general")}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${activeView === "general"
                  ? "bg-brand-primary text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveView("admin")}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${activeView === "admin"
                  ? "bg-brand-primary text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              Admin
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando recursos...</p>
          </div>
        ) : visibleResources.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm py-14 px-6 text-center">
            <UploadCloud size={42} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No hay recursos disponibles
            </h2>
            <p className="text-gray-600">
              {isAdmin
                ? activeView === "admin"
                  ? "Sube un archivo marcado como solo administradores para verlo aqui."
                  : "Sube el primer archivo general para compartirlo con el equipo."
                : "Cuando se agreguen archivos, apareceran en esta seccion."}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleResources.map((resource) => resource.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isAdmin={isAdmin}
                    isDeleting={deletingId === resource.id}
                    isDownloading={downloadingId === resource.id}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default RecursosPage;
