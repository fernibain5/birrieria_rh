import React from "react";
import { Menu, Bell, User, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { userProfile, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-brand-primary border-b border-brand-secondary/40 sm:px-6">
      <div className="flex items-center">
        <button
          type="button"
          className="p-2 text-white rounded-md md:hidden hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-orange-50 rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-secondary">
          <Bell size={20} />
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {userProfile?.displayName || userProfile?.email}
            </div>
            <div className="flex items-center text-xs text-orange-50">
              {isAdmin && <Shield size={12} className="mr-1 text-brand-secondary" />}
              <span className={isAdmin ? "text-brand-secondary" : "text-orange-50"}>
                {isAdmin ? "Administrador" : "Usuario"}
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center">
              <button className="flex items-center max-w-xs p-2 text-sm bg-brand-primaryHover rounded-full focus:outline-none focus:ring-2 focus:ring-brand-secondary">
                <User size={20} className="text-orange-50" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
