import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, orderBy, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole, UserBranch } from '../types/auth';

// Firebase config for secondary app (same config as main app)
const firebaseConfig = {
  apiKey: "AIzaSyA9YJX9gyMLcRaxBPadLF_WD5C6j-uMSn0",
  authDomain: "birrieria-la-purisima.firebaseapp.com",
  projectId: "birrieria-la-purisima",
  storageBucket: "birrieria-la-purisima.firebasestorage.app",
  messagingSenderId: "249871542777",
  appId: "1:249871542777:web:2e4c65a21fef5ef1a03528",
  measurementId: "G-8KHGMH88DQ"
};

// Create secondary app instance for user creation
const secondaryApp = initializeApp(firebaseConfig, 'secondary');
const secondaryAuth = getAuth(secondaryApp);
const secondaryDb = getFirestore(secondaryApp);

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  branch: UserBranch;
  phoneNumber: string;
}

// Create a new user with Firebase Auth and save profile to Firestore
export const createUser = async (userData: CreateUserData): Promise<string> => {
  try {
    // Create user in Firebase Authentication using secondary app
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      userData.email,
      userData.password
    );

    const user = userCredential.user;

    // Create user profile in Firestore using secondary database instance
    // This ensures the newly created user has permission to write their own profile
    const userProfile: Omit<UserProfile, 'uid'> = {
      email: userData.email,
      role: userData.role,
      branch: userData.branch,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber,
    };

    await setDoc(doc(secondaryDb, 'users', user.uid), {
      ...userProfile,
      createdAt: new Date(),
    });

    // Sign out from secondary app to clean up
    await secondaryAuth.signOut();

    return user.uid;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        email: data.email,
        role: data.role,
        branch: data.branch,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}; 