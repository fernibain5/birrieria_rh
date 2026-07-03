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
import {
  AlertCircle,
  Check,
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
import { FilePreview, formatFileSize, getFileIcon } from "../components/FilePreview";
import { downloadFile } from "../utils/downloadFile";

type ResourceView = "general" | "admin";

const getResourceIcon = (resource: Resource) =>
  getFileIcon(resource.originalName, resource.contentType);

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
          <FilePreview
            fileUrl={resource.fileUrl}
            fileName={resource.fileName}
            originalName={resource.originalName}
            contentType={resource.contentType}
          />
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
    setDownloadingId(resource.id);
    setError("");
    await downloadFile(resource.fileUrl, resource.originalName || resource.fileName);
    setDownloadingId(null);
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
