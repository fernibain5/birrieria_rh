import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9YJX9gyMLcRaxBPadLF_WD5C6j-uMSn0",
  authDomain: "birrieria-la-purisima.firebaseapp.com",
  projectId: "birrieria-la-purisima",
  storageBucket: "birrieria-la-purisima.firebasestorage.app",
  messagingSenderId: "249871542777",
  appId: "1:249871542777:web:2e4c65a21fef5ef1a03528",
  measurementId: "G-8KHGMH88DQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, analytics, storage };

export default app; 