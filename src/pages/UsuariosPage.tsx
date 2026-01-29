import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Building,
  UserCheck,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers } from "../services/userService";
import { UserProfile } from "../types/auth";
import AddUserModal from "../components/Users/AddUserModal";
import UserProfileModal from "../components/Users/UserProfileModal";

const UsuariosPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");

  // Load users from Firestore
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Error al cargar los usuarios. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const handleUserCreated = () => {
    loadUsers(); // Reload users after creating a new one
  };

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const handleUserUpdated = () => {
    loadUsers(); // Reload users after updating
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      admin: "Administrador",
      user: "Usuario",
      mesero: "Mesero",
      tortillero: "Tortillero",
      losero: "Losero",
      cocinero: "Cocinero",
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      admin: "bg-red-100 text-red-800",
      user: "bg-gray-100 text-gray-800",
      mesero: "bg-blue-100 text-blue-800",
      tortillero: "bg-green-100 text-green-800",
      losero: "bg-yellow-100 text-yellow-800",
      cocinero: "bg-purple-100 text-purple-800",
    };
    return roleColors[role] || "bg-gray-100 text-gray-800";
  };

  // Group users by branch
  const usersByBranch = users.reduce((acc, user) => {
    const branch = user.branch || "Sin Asignar";
    if (!acc[branch]) {
      acc[branch] = [];
    }
    acc[branch].push(user);
    return acc;
  }, {} as { [key: string]: UserProfile[] });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="text-green-600 mr-4" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-600 mt-1">
                  Administra los usuarios del sistema
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              <UserPlus size={20} className="mr-2" />
              Agregar Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Usuarios
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      San Pedro
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usersByBranch["San Pedro"]?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building className="text-purple-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Las Quintas
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usersByBranch["Las Quintas"]?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <UserCheck className="text-red-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Administradores
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter((user) => user.role === "admin").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users by Branch */}
            {Object.entries(usersByBranch).map(([branch, branchUsers]) => (
              <div key={branch} className="mb-8">
                <div className="flex items-center mb-4">
                  <Building className="text-gray-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Sucursal {branch}
                  </h2>
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {branchUsers.length} usuarios
                  </span>
                </div>

                <div className="mt-4 bg-white shadow-sm rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Puesto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sucursal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {branchUsers.map((user) => (
                        <tr
                          key={user.uid}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleUserClick(user)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-green-600 font-medium">
                                    {user.displayName
                                      ?.charAt(0)
                                      .toUpperCase() ||
                                      user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.displayName || "Sin nombre"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.uid.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail
                                size={16}
                                className="mr-2 text-gray-400"
                              />
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone
                                size={16}
                                className="mr-2 text-gray-400"
                              />
                              {user.phoneNumber
                                ? `+52${user.phoneNumber}`
                                : "No disponible"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.branch || "Sin asignar"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay usuarios registrados
                </h3>
                <p className="text-gray-600 mb-4">
                  Comienza agregando el primer usuario del sistema.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  <UserPlus size={20} className="mr-2" />
                  Agregar Primer Usuario
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {selectedUser && (
        <UserProfileModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};

export default UsuariosPage;
