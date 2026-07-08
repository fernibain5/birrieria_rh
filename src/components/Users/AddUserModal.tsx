import React, { useEffect, useState } from "react";
import { X, User, Mail, Lock, Building, UserCheck, Phone, Calendar, Cake, CalendarDays } from "lucide-react";
import { DIAS_DESCANSO } from "../../types/auth";
import { createUser, CreateUserData } from "../../services/userService";
import { useRoles } from "../../hooks/useRoles";
import { useAuth } from "../../contexts/AuthContext";
import { useBranchLock } from "../../hooks/useBranchLock";

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
  const { isAdmin } = useAuth();
  const { effectiveBranch, canChooseBranch } = useBranchLock();

  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    displayName: "",
    role: "mesero",
    branch: "San Pedro",
    phoneNumber: "",
    hireDate: "",
    birthDate: "",
    restDay: "",
  });
  const [grantAdmin, setGrantAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { roles, loading: rolesLoading } = useRoles();
  const roleOptions = roles.filter(
    (r) => r.value !== 'admin' && r.value !== 'user' && (isAdmin || r.value !== 'gerente')
  );

  const branchOptions: { value: string; label: string }[] = [
    { value: "San Pedro", label: "San Pedro" },
    { value: "Las Quintas", label: "Las Quintas" },
  ];

  // Non-admin callers (gerente) can't pick a branch — lock the form value to
  // their own branch, matching what happens server-side regardless.
  useEffect(() => {
    if (!canChooseBranch && isOpen) {
      setFormData((prev) => ({ ...prev, branch: effectiveBranch }));
    }
  }, [canChooseBranch, effectiveBranch, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (
      !formData.email ||
      !formData.password ||
      !formData.displayName ||
      !formData.phoneNumber ||
      !formData.restDay
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
      await createUser({
        ...formData,
        role: grantAdmin ? "admin" : formData.role,
        branch: grantAdmin ? "" : formData.branch,
        hireDate: formData.hireDate || undefined,
        birthDate: formData.birthDate || undefined,
      });

      // Reset form
      setFormData({
        email: "",
        password: "",
        displayName: "",
        role: "mesero",
        branch: "San Pedro",
        phoneNumber: "",
        hireDate: "",
        birthDate: "",
        restDay: "",
      });
      setGrantAdmin(false);

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
            <User className="text-brand-secondary mr-3" size={24} />
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
              placeholder="correo@ejemplo.com"
              autoComplete="off"
              readOnly
              onFocus={(e) => e.currentTarget.removeAttribute("readOnly")}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
              placeholder="Al menos 6 caracteres"
              autoComplete="new-password"
              readOnly
              onFocus={(e) => e.currentTarget.removeAttribute("readOnly")}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
              placeholder="1234567890"
              disabled={loading}
              required
            />
          </div>

          {/* Hire Date & Birth Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="hireDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Calendar size={16} className="inline mr-2" />
                Fecha de Ingreso
              </label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Cake size={16} className="inline mr-2" />
                Fecha de Cumpleaños
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Rest day */}
          <div>
            <label
              htmlFor="restDay"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <CalendarDays size={16} className="inline mr-2" />
              Día de descanso
            </label>
            <select
              id="restDay"
              name="restDay"
              value={formData.restDay}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
              disabled={loading}
              required
            >
              <option value="" disabled>
                Selecciona un día
              </option>
              {DIAS_DESCANSO.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>
          </div>

          {/* Admin checkbox */}
          {isAdmin && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="grantAdmin"
                checked={grantAdmin}
                onChange={(e) => setGrantAdmin(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-brand-secondary border-gray-300 rounded focus:ring-brand-secondary"
              />
              <label htmlFor="grantAdmin" className="text-sm font-medium text-gray-700">
                Administrador
              </label>
            </div>
          )}

          {/* Role */}
          {!grantAdmin && (
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                disabled={loading || rolesLoading}
                required
              >
                {rolesLoading ? (
                  <option value="">Cargando...</option>
                ) : (
                  roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Branch */}
          {!grantAdmin && (
            <div>
              <label
                htmlFor="branch"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Building size={16} className="inline mr-2" />
                Sucursal
              </label>
              {canChooseBranch ? (
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                  disabled={loading}
                  required
                >
                  {branchOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                  {effectiveBranch}
                </p>
              )}
            </div>
          )}

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
              className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors disabled:opacity-50"
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
