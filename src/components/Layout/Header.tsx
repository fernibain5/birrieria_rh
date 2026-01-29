import React from "react";
import { Menu, Bell, User, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { userProfile, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6">
      <div className="flex items-center">
        <button
          type="button"
          className="p-2 text-gray-500 rounded-md md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
          <Bell size={20} />
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              {userProfile?.displayName || userProfile?.email}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              {isAdmin && <Shield size={12} className="mr-1 text-green-600" />}
              <span className={isAdmin ? "text-green-600" : "text-gray-500"}>
                {isAdmin ? "Administrador" : "Usuario"}
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center">
              <button className="flex items-center max-w-xs p-2 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500">
                <User size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
