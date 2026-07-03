import React, { useState } from 'react';
import { X, Trash2, Plus, Shield, Pencil, Check } from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import { createRole, deleteRole, updateRole } from '../../services/roleService';
import { RoleDefinition } from '../../types/auth';

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  { value: 'bg-blue-100 text-blue-800',   label: 'Azul' },
  { value: 'bg-green-100 text-green-800', label: 'Verde' },
  { value: 'bg-yellow-100 text-yellow-800', label: 'Amarillo' },
  { value: 'bg-purple-100 text-purple-800', label: 'Morado' },
  { value: 'bg-red-100 text-red-800',     label: 'Rojo' },
  { value: 'bg-gray-100 text-gray-800',   label: 'Gris' },
  { value: 'bg-orange-100 text-orange-800', label: 'Naranja' },
  { value: 'bg-pink-100 text-pink-800',   label: 'Rosa' },
  { value: 'bg-indigo-100 text-indigo-800', label: 'Índigo' },
  { value: 'bg-teal-100 text-teal-800',   label: 'Verde azulado' },
];

const toSlug = (label: string) =>
  label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

const ManageRolesModal: React.FC<ManageRolesModalProps> = ({ isOpen, onClose }) => {
  const { roles, loading, refetch } = useRoles();

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value);
  const [saving, setSaving] = useState(false);
  const [deletingValue, setDeletingValue] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const startEditing = (role: RoleDefinition) => {
    setError('');
    setEditingValue(role.value);
    setEditingLabel(role.label);
  };

  const cancelEditing = () => {
    setEditingValue(null);
    setEditingLabel('');
  };

  const handleSaveEdit = async (role: RoleDefinition) => {
    const label = editingLabel.trim();
    if (!label) {
      setError('El nombre del rol no puede estar vacío.');
      return;
    }

    try {
      setSavingEdit(true);
      await updateRole({ value: role.value, label, color: role.color });
      await refetch();
      cancelEditing();
    } catch {
      setError('Error al actualizar el nombre del rol.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    setNewLabel(label);
    setNewValue(toSlug(label));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newLabel.trim() || !newValue.trim()) {
      setError('El nombre y el identificador son obligatorios.');
      return;
    }

    if (roles.some(r => r.value === newValue)) {
      setError(`Ya existe un rol con el identificador "${newValue}".`);
      return;
    }

    try {
      setSaving(true);
      await createRole({ value: newValue, label: newLabel.trim(), color: newColor });
      await refetch();
      setNewLabel('');
      setNewValue('');
      setNewColor(COLOR_OPTIONS[0].value);
    } catch {
      setError('Error al crear el rol. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (value: string) => {
    try {
      setDeletingValue(value);
      await deleteRole(value);
      await refetch();
    } catch {
      setError('Error al eliminar el rol.');
    } finally {
      setDeletingValue(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center">
            <Shield className="text-brand-secondary mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Gestionar Roles</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Role list */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Roles actuales</h3>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : (
              <ul className="space-y-2">
                {roles.map((role) => (
                  <li key={role.value} className="flex items-center justify-between py-2 px-3 rounded-md border border-gray-100 bg-gray-50">
                    {editingValue === role.value ? (
                      <>
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            autoFocus
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                            disabled={savingEdit}
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleSaveEdit(role)}
                            disabled={savingEdit}
                            className="text-green-500 hover:text-green-700 transition-colors disabled:opacity-40"
                            title="Guardar"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={savingEdit}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.color}`}>
                            {role.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEditing(role)}
                            className="text-gray-400 hover:text-brand-secondary transition-colors"
                            title="Editar nombre"
                          >
                            <Pencil size={16} />
                          </button>
                          {role.isSystem ? (
                            <span className="text-xs text-gray-400 italic">sistema</span>
                          ) : (
                            <button
                              onClick={() => handleDelete(role.value)}
                              disabled={deletingValue === role.value}
                              className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                              title="Eliminar rol"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add new role form */}
          <form onSubmit={handleAdd} className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Agregar nuevo rol</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del rol</label>
              <input
                type="text"
                value={newLabel}
                onChange={handleLabelChange}
                placeholder="Ej. Cajero"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Identificador <span className="text-gray-400">(generado automáticamente)</span>
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="cajero"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewColor(opt.value)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-2 transition-all ${opt.value} ${
                      newColor === opt.value ? 'border-gray-700 scale-110' : 'border-transparent'
                    }`}
                    title={opt.label}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryHover transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Plus size={16} />
              {saving ? 'Guardando...' : 'Agregar Rol'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageRolesModal;
