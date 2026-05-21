// One-time script to seed default roles into Firestore
// Run with: node scripts/setup-roles.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA9YJX9gyMLcRaxBPadLF_WD5C6j-uMSn0',
  authDomain: 'birrieria-la-purisima.firebaseapp.com',
  projectId: 'birrieria-la-purisima',
  storageBucket: 'birrieria-la-purisima.firebasestorage.app',
  messagingSenderId: '249871542777',
  appId: '1:249871542777:web:2e4c65a21fef5ef1a03528',
};

const DEFAULT_ROLES = [
  { value: 'admin',      label: 'Administrador', color: 'bg-red-100 text-red-800',       isSystem: true },
  { value: 'user',       label: 'Usuario',        color: 'bg-gray-100 text-gray-800',     isSystem: true },
  { value: 'mesero',     label: 'Mesero',         color: 'bg-blue-100 text-blue-800',     isSystem: false },
  { value: 'tortillero', label: 'Tortillero',     color: 'bg-green-100 text-green-800',   isSystem: false },
  { value: 'losero',     label: 'Losero',         color: 'bg-yellow-100 text-yellow-800', isSystem: false },
  { value: 'cocinero',   label: 'Cocinero',       color: 'bg-purple-100 text-purple-800', isSystem: false },
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  for (const role of DEFAULT_ROLES) {
    const ref = doc(db, 'roles', role.value);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      console.log(`Skipping "${role.value}" — already exists.`);
    } else {
      await setDoc(ref, role);
      console.log(`Created role "${role.value}".`);
    }
  }
  console.log('Done.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
