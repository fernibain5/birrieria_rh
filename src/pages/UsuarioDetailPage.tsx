import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Cake,
  Calendar,
  CalendarDays,
  Clock,
  FolderOpen,
  Link2,
  Loader2,
  Lock,
  Mail,
  Phone,
  Plus,
  Trash2,
  Upload,
  User,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useRoles } from "../hooks/useRoles";
import { useBranchLock } from "../hooks/useBranchLock";
import { changeUserPassword, getAllUsers, getUserById, linkEmployee, updateUser } from "../services/userService";
import {
  deleteUserDocument,
  getUserDocuments,
  uploadUserDocument,
} from "../services/userDocumentService";
import { getEmployees, getRestaurants } from "../services/attendanceApiService";
import { UserProfile, UserBranch } from "../types/auth";
import { UserDocument } from "../types/userDocument";
import { AttendanceEmployee } from "../types/Attendance";
import { FilePreview, formatFileSize, getFileIcon } from "../components/FilePreview";
import { downloadFile } from "../utils/downloadFile";
import { calculateSeniority } from "../utils/seniority";
import RestDaysCheckboxGroup from "../components/ui/RestDaysCheckboxGroup";

const ALL_BRANCHES: { value: UserBranch; label: string }[] = [
  { value: "San Pedro", label: "San Pedro" },
  { value: "Las Quintas", label: "Las Quintas" },
];

const getDocumentDate = (document: UserDocument) =>
  document.createdAt
    ? new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(document.createdAt)
    : "Fecha pendiente";

interface DocumentCardProps {
  doc: UserDocument;
  isDeleting: boolean;
  isDownloading: boolean;
  onDelete: (doc: UserDocument) => void;
  onDownload: (doc: UserDocument) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  isDeleting,
  isDownloading,
  onDelete,
  onDownload,
}) => {
  const DocIcon = getFileIcon(doc.originalName, doc.contentType);
  const isBusy = isDeleting || isDownloading;

  return (
    <div className="relative overflow-hidden bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="p-5 pb-5">
        <div className="flex items-start gap-2">
          <DocIcon size={18} className="mt-1 shrink-0 text-brand-secondary" />
          <h3 className="text-base font-semibold text-gray-900 break-words">{doc.fileName}</h3>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isBusy) {
              onDownload(doc);
            }
          }}
          disabled={isBusy}
          className="mt-4 block h-52 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50 text-left focus:outline-none focus:ring-2 focus:ring-brand-secondary disabled:cursor-not-allowed disabled:opacity-70"
          title="Descargar documento"
        >
          <FilePreview
            fileUrl={doc.fileUrl}
            fileName={doc.fileName}
            originalName={doc.originalName}
            contentType={doc.contentType}
          />
        </button>

        <p className="mt-4 pr-20 text-sm text-gray-500">{getDocumentDate(doc)}</p>
      </div>

      {isBusy && <div className="absolute inset-0 z-10 cursor-wait bg-white/40" />}

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDelete(doc)}
          disabled={isBusy}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 shadow-sm ring-1 ring-red-100 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
          title="Eliminar documento"
        >
          {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
        </button>

        <button
          type="button"
          onClick={() => onDownload(doc)}
          disabled={isBusy}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-secondary text-white shadow-sm hover:bg-brand-secondaryHover focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          title="Descargar documento"
        >
          {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
        </button>
      </div>
    </div>
  );
};

const UsuarioDetailPage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, isGerente, userProfile } = useAuth();
  const { roles } = useRoles();
  const { canChooseBranch } = useBranchLock();
  const roleOptions = roles.filter((r) => isAdmin || (r.value !== "admin" && r.value !== "gerente"));

  const seedUser = (location.state as { user?: UserProfile } | null)?.user;

  const [user, setUser] = useState<UserProfile | null>(seedUser ?? null);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(seedUser ?? null);
  const [loadingUser, setLoadingUser] = useState(!seedUser);
  const [notFound, setNotFound] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [availableEmployees, setAvailableEmployees] = useState<AttendanceEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [linkingEmployee, setLinkingEmployee] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");
  const [linkedElsewhereIds, setLinkedElsewhereIds] = useState<Set<number>>(new Set());

  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!uid) return;
    let canceled = false;

    setLoadingUser(true);
    getUserById(uid)
      .then((fresh) => {
        if (canceled) return;
        setUser(fresh);
        setEditedUser(fresh);
        setNotFound(false);
      })
      .catch((error) => {
        console.error("Error loading user:", error);
        if (!canceled) setNotFound(true);
      })
      .finally(() => {
        if (!canceled) setLoadingUser(false);
      });

    return () => {
      canceled = true;
    };
  }, [uid]);

  const loadDocuments = async () => {
    if (!uid) return;
    try {
      setLoadingDocuments(true);
      setDocumentsError("");
      setDocuments(await getUserDocuments(uid));
    } catch (error) {
      console.error("Error loading user documents:", error);
      setDocumentsError("Error al cargar los documentos. Por favor, intenta nuevamente.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    setSelectedEmployeeId(user?.employeeId ? String(user.employeeId) : "");
  }, [user?.employeeId]);

  const loadLinkedElsewhere = async () => {
    if (!uid) return;
    try {
      const allUsers = await getAllUsers();
      const taken = new Set(
        allUsers
          .filter((u) => u.uid !== uid && u.employeeId != null)
          .map((u) => u.employeeId as number)
      );
      setLinkedElsewhereIds(taken);
    } catch (error) {
      console.error("Error loading linked employees:", error);
      setLinkedElsewhereIds(new Set());
    }
  };

  useEffect(() => {
    loadLinkedElsewhere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    if (!user?.branch) {
      setAvailableEmployees([]);
      return;
    }
    let canceled = false;
    setLoadingEmployees(true);
    getRestaurants()
      .then((restaurants) => {
        const restaurant = restaurants.find((r) => r.name === user.branch);
        if (!restaurant) return [];
        return getEmployees(restaurant.id);
      })
      .then((list) => {
        if (!canceled) setAvailableEmployees(list ?? []);
      })
      .catch((error) => {
        console.error("Error loading Hikvision employees:", error);
        if (!canceled) setAvailableEmployees([]);
      })
      .finally(() => {
        if (!canceled) setLoadingEmployees(false);
      });
    return () => {
      canceled = true;
    };
  }, [user?.branch]);

  const handleLinkEmployee = async (e: FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    setLinkError("");
    setLinkSuccess("");
    try {
      setLinkingEmployee(true);
      const employeeId = selectedEmployeeId ? Number(selectedEmployeeId) : null;
      const updated = await linkEmployee(uid, employeeId);
      setUser(updated);
      setEditedUser(updated);
      await loadLinkedElsewhere();
      setLinkSuccess(
        employeeId ? "Usuario vinculado con el empleado de Hikvision" : "Vínculo eliminado"
      );
    } catch (error) {
      console.error("Error linking employee:", error);
      const isConflict = error instanceof Error && error.message.includes("API 409");
      setLinkError(
        isConflict
          ? "Este empleado ya está vinculado a otro usuario."
          : "Error al vincular el empleado. Por favor, intenta nuevamente."
      );
    } finally {
      setLinkingEmployee(false);
    }
  };

  const handleProfileInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedUser((prev) =>
      prev
        ? {
          ...prev,
          [name]: value,
          ...(name === "role" && value === "admin" ? { branch: undefined } : {}),
        }
        : prev
    );
    setIsEditingProfile(true);
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!uid || !editedUser) return;

    try {
      setSavingProfile(true);
      setProfileError("");
      const updated = await updateUser(uid, {
        displayName: editedUser.displayName,
        role: editedUser.role,
        branch: editedUser.role === "admin" ? "" : editedUser.branch,
        phoneNumber: editedUser.phoneNumber,
        hireDate: editedUser.hireDate || undefined,
        birthDate: editedUser.birthDate || undefined,
        restDays: editedUser.restDays ?? [],
      });
      setUser(updated);
      setEditedUser(updated);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setProfileError("Error al actualizar el usuario. Por favor, intenta nuevamente.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    try {
      setChangingPassword(true);
      await changeUserPassword(uid, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Contraseña actualizada correctamente");
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("Error al actualizar la contraseña. Por favor, intenta nuevamente.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDocFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedDocFile(file);

    if (file && !docFileName.trim()) {
      setDocFileName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const resetDocForm = () => {
    setDocFileName("");
    setSelectedDocFile(null);
    if (docFileInputRef.current) {
      docFileInputRef.current.value = "";
    }
  };

  const handleUploadDoc = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uid || !currentUser || !selectedDocFile || !docFileName.trim()) return;

    try {
      setUploadingDoc(true);
      setDocumentsError("");
      await uploadUserDocument({
        userId: uid,
        fileName: docFileName,
        file: selectedDocFile,
        uploadedBy: currentUser.uid,
      });
      resetDocForm();
      await loadDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      setDocumentsError("Error al subir el documento. Verifica el archivo e intenta nuevamente.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDownloadDoc = async (doc: UserDocument) => {
    setDownloadingDocId(doc.id);
    await downloadFile(doc.fileUrl, doc.originalName || doc.fileName);
    setDownloadingDocId(null);
  };

  const handleDeleteDoc = async (doc: UserDocument) => {
    const confirmed = window.confirm(`Eliminar "${doc.fileName}"?`);
    if (!confirmed) return;

    try {
      setDeletingDocId(doc.id);
      setDocumentsError("");
      await deleteUserDocument(doc);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (error) {
      console.error("Error deleting document:", error);
      setDocumentsError("Error al eliminar el documento. Por favor, intenta nuevamente.");
    } finally {
      setDeletingDocId(null);
    }
  };

  const selectableEmployees = availableEmployees.filter((emp) => !linkedElsewhereIds.has(emp.id));
  const hiddenLinkedCount = availableEmployees.length - selectableEmployees.length;

  const BackButton = (
    <button
      type="button"
      onClick={() => navigate("/dashboard/usuarios")}
      className="flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Regresar</span>
    </button>
  );

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {BackButton}
          <div className="mt-8 bg-white rounded-lg shadow-sm py-14 px-6 text-center">
            <User size={42} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Usuario no encontrado</h2>
            <p className="text-gray-600">El usuario que buscas no existe o fue eliminado.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingUser || !user || !editedUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {BackButton}
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuario...</p>
          </div>
        </div>
      </div>
    );
  }

  // A gerente can only view/edit users in their own branch. Admins have no
  // branch (undefined) so this also blocks a gerente from opening an admin.
  if (isGerente && user.branch !== userProfile?.branch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {BackButton}
          <div className="flex items-center mt-4">
            <div className="h-14 w-14 rounded-full bg-brand-secondarySoft flex items-center justify-center mr-4">
              <span className="text-brand-primary text-xl font-medium">
                {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.displayName || "Sin nombre"}
              </h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Perfil</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {profileError}
              </div>
            )}

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                Nombre Completo
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={editedUser.displayName || ""}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                placeholder="Nombre del empleado"
                disabled={savingProfile}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={editedUser.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                <UserCheck size={16} className="inline mr-2" />
                Rol
              </label>
              <select
                id="role"
                name="role"
                value={editedUser.role}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                disabled={savingProfile}
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {editedUser.role !== "admin" && (
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                  <Building size={16} className="inline mr-2" />
                  Sucursal
                </label>
                {canChooseBranch ? (
                  <select
                    id="branch"
                    name="branch"
                    value={editedUser.branch || "San Pedro"}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                    disabled={savingProfile}
                  >
                    {ALL_BRANCHES.map((branch) => (
                      <option key={branch.value} value={branch.value}>
                        {branch.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                    {editedUser.branch || "San Pedro"}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Número de Teléfono
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={editedUser.phoneNumber || ""}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                placeholder="Número de teléfono"
                disabled={savingProfile}
              />
            </div>

            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Fecha de Ingreso
              </label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={editedUser.hireDate || ""}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                disabled={savingProfile}
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Cake size={16} className="inline mr-2" />
                Fecha de Cumpleaños
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={editedUser.birthDate || ""}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                disabled={savingProfile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDays size={16} className="inline mr-2" />
                Días de descanso
              </label>
              <RestDaysCheckboxGroup
                value={editedUser.restDays ?? []}
                onChange={(restDays) => {
                  setEditedUser((prev) => (prev ? { ...prev, restDays } : prev));
                  setIsEditingProfile(true);
                }}
                disabled={savingProfile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-2" />
                Antigüedad
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                {calculateSeniority(editedUser.hireDate)}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="submit"
                disabled={!isEditingProfile || savingProfile}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>

        {/* Password section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Cambiar Contraseña</h2>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {passwordSuccess}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock size={16} className="inline mr-2" />
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                placeholder="Al menos 6 caracteres"
                autoComplete="new-password"
                disabled={changingPassword}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock size={16} className="inline mr-2" />
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
                disabled={changingPassword}
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="submit"
                disabled={!newPassword || !confirmPassword || changingPassword}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? "Guardando..." : "Cambiar Contraseña"}
              </button>
            </div>
          </form>
        </div>

        {/* Hikvision link section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Vínculo con Incidencias (Hikvision)</h2>

          <form onSubmit={handleLinkEmployee} className="space-y-6">
            {linkError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {linkError}
              </div>
            )}
            {linkSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {linkSuccess}
              </div>
            )}

            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                <Link2 size={16} className="inline mr-2" />
                Empleado en Hikvision
              </label>
              <select
                id="employeeId"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                disabled={linkingEmployee || loadingEmployees || !user.branch}
              >
                <option value="">Sin vincular</option>
                {selectableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID Hikvision: {emp.hikvisionId})
                  </option>
                ))}
              </select>
              {!user.branch && (
                <p className="mt-2 text-sm text-gray-500">
                  Asigna una sucursal a este usuario para poder vincularlo con un empleado de Hikvision.
                </p>
              )}
              {user.branch && hiddenLinkedCount > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {hiddenLinkedCount} empleado{hiddenLinkedCount !== 1 ? "s" : ""} de esta
                  sucursal ya {hiddenLinkedCount !== 1 ? "están vinculados" : "está vinculado"} a
                  otro usuario y no aparece{hiddenLinkedCount !== 1 ? "n" : ""} en esta lista. Para
                  reasignarlo, primero elimina su vínculo desde el usuario que lo tiene.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="submit"
                disabled={linkingEmployee || loadingEmployees || !user.branch}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {linkingEmployee ? "Guardando..." : "Guardar vínculo"}
              </button>
            </div>
          </form>
        </div>

        {/* Documents section */}
        <div>
          <div className="flex items-center mb-4">
            <FolderOpen className="text-gray-600 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Documentos</h2>
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              {documents.length}
            </span>
          </div>

          {documentsError && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <div className="flex items-center">
                <AlertCircle size={18} className="mr-2 shrink-0" />
                <span>{documentsError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleUploadDoc} className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="docName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del documento
                  </label>
                  <input
                    id="docName"
                    type="text"
                    value={docFileName}
                    onChange={(e) => setDocFileName(e.target.value)}
                    className="input"
                    placeholder="Ej. Identificación oficial"
                    disabled={uploadingDoc}
                  />
                </div>

                <div>
                  <label htmlFor="docFile" className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo (.docx o imagen)
                  </label>
                  <input
                    ref={docFileInputRef}
                    id="docFile"
                    type="file"
                    accept=".docx,image/*"
                    onChange={handleDocFileChange}
                    className="input"
                    disabled={uploadingDoc}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedDocFile || !docFileName.trim() || uploadingDoc}
                className="btn btn-primary self-end h-10"
              >
                {uploadingDoc ? (
                  <Loader2 size={18} className="mr-2 animate-spin" />
                ) : (
                  <Plus size={18} className="mr-2" />
                )}
                {uploadingDoc ? "Subiendo..." : "Agregar"}
              </button>
            </div>

            {selectedDocFile && (
              <p className="mt-3 text-sm text-gray-500">
                Seleccionado: {selectedDocFile.name} ({formatFileSize(selectedDocFile.size)})
              </p>
            )}
          </form>

          {loadingDocuments ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando documentos...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm py-14 px-6 text-center">
              <FolderOpen size={42} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay documentos para este usuario
              </h3>
              <p className="text-gray-600">
                Sube el primer documento o imagen para verlo aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  isDeleting={deletingDocId === doc.id}
                  isDownloading={downloadingDocId === doc.id}
                  onDelete={handleDeleteDoc}
                  onDownload={handleDownloadDoc}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuarioDetailPage;
