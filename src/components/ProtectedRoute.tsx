import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  managerOnly = false,
}) => {
  const { currentUser, isAdmin, isManager } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard/calendario" replace />;
  }

  if (managerOnly && !isManager) {
    return <Navigate to="/dashboard/calendario" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
