import React, { useState, useEffect } from "react";
import { X, User, Mail, Building, UserCheck, Phone, Upload, File } from "lucide-react";
import { UserProfile, UserRole, UserBranch } from "../../types/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/config";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUserUpdated: () => void;
}

const ALL_ROLES: { value: UserRole; label: string }[] = [
  { value: 'mesero', label: 'Mesero' },
  { value: 'tortillero', label: 'Tortillero' },
  { value: 'losero', label: 'Losero' },
  { value: 'cocinero', label: 'Cocinero' },
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
];

const ALL_BRANCHES: { value: UserBranch; label: string }[] = [
  { value: 'San Pedro', label: 'San Pedro' },
  { value: 'Las Quintas', label: 'Las Quintas' },
];

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [editedUser, setEditedUser] = useState<UserProfile>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [allFiles, setAllFiles] = useState<string[]>(user.allFiles || []);

  useEffect(() => {
    setEditedUser(user);
    setAllFiles(user.allFiles || []);
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
      setIsEditing(true);
    }
  };

  const uploadFiles = async () => {
    if (!selectedFiles) return;

    setUploadingFiles(true);
    const newFileUrls: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const storageRef = ref(storage, `users/${user.uid}/files/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        newFileUrls.push(downloadUrl);
      }

      const updatedFiles = [...allFiles, ...newFileUrls];
      setAllFiles(updatedFiles);
      setEditedUser(prev => ({
        ...prev,
        allFiles: updatedFiles
      }));
      setSelectedFiles(null);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError("Error al subir los archivos. Por favor, intenta nuevamente.");
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (selectedFiles) {
        await uploadFiles();
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: editedUser.displayName,
        role: editedUser.role,
        branch: editedUser.branch,
        phoneNumber: editedUser.phoneNumber,
        allFiles: editedUser.allFiles,
      });

      onUserUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Error al actualizar el usuario. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <User className="text-green-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Perfil de Usuario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <User size={16} className="inline mr-2" />
              Nombre Completo
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={editedUser.displayName || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nombre del empleado"
              disabled={loading}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
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

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <UserCheck size={16} className="inline mr-2" />
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={editedUser.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            >
              {ALL_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label
              htmlFor="branch"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Building size={16} className="inline mr-2" />
              Sucursal
            </label>
            <select
              id="branch"
              name="branch"
              value={editedUser.branch || "San Pedro"}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            >
              {ALL_BRANCHES.map((branch) => (
                <option key={branch.value} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Phone size={16} className="inline mr-2" />
              Número de Teléfono
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={editedUser.phoneNumber || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Número de teléfono"
              disabled={loading}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload size={16} className="inline mr-2" />
              Archivos
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Subir archivos</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={loading || uploadingFiles}
                    />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF hasta 10MB
                </p>
              </div>
            </div>
            {selectedFiles && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {selectedFiles.length} archivo(s) seleccionado(s)
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {allFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                <File size={16} className="inline mr-2" />
                Archivos Subidos
              </h3>
              <ul className="space-y-2">
                {allFiles.map((fileUrl, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <File size={16} className="mr-2" />
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-500"
                    >
                      {fileUrl.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isEditing || loading || uploadingFiles}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploadingFiles ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal; 