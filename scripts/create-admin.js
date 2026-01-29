// One-time script to create the first admin user
// Run this with: node scripts/create-admin.js

const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA9YJX9gyMLcRaxBPadLF_WD5C6j-uMSn0",
  authDomain: "birrieria-la-purisima.firebaseapp.com",
  projectId: "birrieria-la-purisima",
  storageBucket: "birrieria-la-purisima.firebasestorage.app",
  messagingSenderId: "249871542777",
  appId: "1:249871542777:web:2e4c65a21fef5ef1a03528",
  measurementId: "G-8KHGMH88DQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    console.log("Creating admin user...");

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      "admin@birrieria.com",
      "AdminPassword123!" // Change this password!
    );

    const user = userCredential.user;
    console.log("✅ User created with UID:", user.uid);

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      role: "admin",
      displayName: "Administrador Principal",
      email: user.email,
      createdAt: new Date(),
    });

    console.log("✅ Admin role set in Firestore");
    console.log("🎉 Admin user created successfully!");
    console.log("📧 Email: admin@birrieria.com");
    console.log("🔑 Password: AdminPassword123! (CHANGE THIS!)");
    console.log("👑 Role: admin");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);

    if (error.code === "auth/email-already-in-use") {
      console.log("💡 User already exists. Setting admin role...");
      // If user exists, you can manually set the role in Firestore
    }
  }

  process.exit(0);
}

createAdminUser();
