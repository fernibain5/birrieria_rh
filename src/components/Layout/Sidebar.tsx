import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  FileText,
  BookOpen,
  Clock,
  LogOut,
  ScrollText,
  Users,
  ClipboardList,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Calendario",
      path: "/dashboard/calendario",
      icon: <Calendar size={20} />,
      show: true,
    },
    {
      name: "Minutas",
      path: "/dashboard/minutas",
      icon: <FileText size={20} />,
      show: true,
    },
    {
      name: "Recursos",
      path: "/dashboard/recursos",
      icon: <BookOpen size={20} />,
      show: true,
    },
    {
      name: "Reglamento",
      path: "/dashboard/reglamento",
      icon: <ScrollText size={20} />,
      show: true,
    },
    {
      name: "Contratos",
      path: "/dashboard/contratos",
      icon: <ClipboardList size={20} />,
      show: isAdmin,
    },
    {
      name: "Checador",
      path: "/dashboard/checador",
      icon: <Clock size={20} />,
      show: isAdmin,
    },
    {
      name: "Usuarios",
      path: "/dashboard/usuarios",
      icon: <Users size={20} />,
      show: isAdmin,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col w-64 bg-green-900 border-r border-gray-200">
          <div className="flex items-center justify-between h-16 bg-green-800 px-4">
            <div className="text-lg font-bold text-white">
              Birrieria La Purisima
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white rounded-md md:hidden hover:bg-green-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-2">
              {navItems
                .filter((item) => item.show)
                .map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                        isActive
                          ? "bg-green-700 text-white"
                          : "text-green-100 hover:bg-green-800 hover:text-white"
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
            </nav>
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-green-100 rounded-md hover:bg-green-800 hover:text-white transition-colors duration-150 ease-in-out"
              >
                <LogOut size={20} className="mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
