import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, UserProfile } from '../types/auth';
import { apiPost, clearToken, getToken, setToken } from '../services/apiClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await apiPost<{ access_token: string; user: UserProfile }>(
      '/auth/login',
      { email, password },
    );
    setToken(data.access_token);
    setUserProfile(data.user);
  };

  const logout = async (): Promise<void> => {
    clearToken();
    setUserProfile(null);
  };

  // Restore session on mount if a valid token exists in localStorage
  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const BASE = import.meta.env.VITE_API_URL as string;
        const res = await fetch(`${BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profile = await res.json() as UserProfile;
          setUserProfile(profile);
        } else {
          clearToken();
        }
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const currentUser = userProfile ? { uid: userProfile.uid } : null;
  const isAdmin = userProfile?.role === 'admin';

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    logout,
    loading,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
