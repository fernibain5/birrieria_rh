import React, { useState } from "react";
import { X, User, Mail, Lock, Building, UserCheck, Phone } from "lucide-react";
import { UserRole, UserBranch } from "../../types/auth";
import { createUser, CreateUserData } from "../../services/userService";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    displayName: "",
    role: "mesero",
    branch: "San Pedro",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: "mesero", label: "Mesero" },
    { value: "tortillero", label: "Tortillero" },
    { value: "losero", label: "Losero" },
    { value: "cocinero", label: "Cocinero" },
  ];

  const branchOptions: { value: UserBranch; label: string }[] = [
    { value: "San Pedro", label: "San Pedro" },
    { value: "Las Quintas", label: "Las Quintas" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (
      !formData.email ||
      !formData.password ||
      !formData.displayName ||
      !formData.phoneNumber
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Validate Mexican phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("El número de teléfono debe tener 10 dígitos");
      return;
    }

    try {
      setLoading(true);
      await createUser(formData);

      // Reset form
      setFormData({
        email: "",
        password: "",
        displayName: "",
        role: "mesero",
        branch: "San Pedro",
        phoneNumber: "",
      });

      onUserCreated();
      onClose();
    } catch (error: any) {
      console.error("Error creating user:", error);

      // Handle Firebase Auth errors
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("Este correo electrónico ya está en uso");
          break;
        case "auth/invalid-email":
          setError("Correo electrónico inválido");
          break;
        case "auth/weak-password":
          setError("La contraseña es muy débil");
          break;
        default:
          setError("Error al crear el usuario. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <User className="text-green-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Agregar Nuevo Usuario
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nombre del empleado"
              disabled={loading}
              required
            />
          </div>

          {/* Email */}
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
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="correo@ejemplo.com"
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Lock size={16} className="inline mr-2" />
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Al menos 6 caracteres"
              disabled={loading}
              required
              minLength={6}
            />
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
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="1234567890"
              disabled={loading}
              required
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <UserCheck size={16} className="inline mr-2" />
              Puesto
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
              required
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              value={formData.branch}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
              required
            >
              {branchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
