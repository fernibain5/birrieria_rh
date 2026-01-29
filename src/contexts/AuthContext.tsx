import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { AuthContextType, UserProfile } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const fetchUserProfile = async (user: User): Promise<void> => {
    try {
      console.log("🔍 DEBUG: Fetching profile for user UID:", user.uid);
      const userDoc = await getDoc(doc(db, "users", user.uid));

      console.log("🔍 DEBUG: Document exists:", userDoc.exists());

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("🔍 DEBUG: User data from Firestore:", userData);
        console.log("🔍 DEBUG: Role from Firestore:", userData.role);

        setUserProfile({
          uid: user.uid,
          email: user.email || "",
          role: userData.role || "user",
          branch: userData.branch || "San Pedro", // Default to San Pedro if no branch specified
          displayName: userData.displayName || user.displayName || undefined,
          phoneNumber: userData.phoneNumber || undefined,
        });

        console.log(
          "🔍 DEBUG: Set user profile with role:",
          userData.role || "user",
          "and branch:",
          userData.branch || "San Pedro"
        );
      } else {
        console.log(
          "🔍 DEBUG: No Firestore document found, defaulting to 'user' role and 'San Pedro' branch"
        );
        // Default to regular user if no profile exists
        setUserProfile({
          uid: user.uid,
          email: user.email || "",
          role: "user",
          branch: "San Pedro",
        });
      }
    } catch (error) {
      console.error("🔍 DEBUG: Error fetching user profile:", error);
      // Fallback to default user profile
      setUserProfile({
        uid: user.uid,
        email: user.email || "",
        role: "user",
        branch: "San Pedro",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "🔍 DEBUG: Auth state changed. User:",
        user?.email || "No user"
      );
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAdmin = userProfile?.role === "admin";
  console.log(
    "🔍 DEBUG: isAdmin:",
    isAdmin,
    "userProfile?.role:",
    userProfile?.role,
    "userProfile?.branch:",
    userProfile?.branch
  );

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
