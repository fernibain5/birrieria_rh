import { collection, getDocs, deleteDoc, setDoc, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { RoleDefinition } from '../types/auth';

const COLLECTION = 'roles';

const DEFAULT_ROLES: RoleDefinition[] = [
  { value: 'admin',       label: 'Administrador',    color: 'bg-red-100 text-red-800',       isSystem: true },
  { value: 'user',        label: 'Usuario',           color: 'bg-gray-100 text-gray-800',     isSystem: true },
  { value: 'mesero',      label: 'Mesero',            color: 'bg-blue-100 text-blue-800',     isSystem: false },
  { value: 'tortillero',  label: 'Tortillero',        color: 'bg-green-100 text-green-800',   isSystem: false },
  { value: 'losero',      label: 'Losero',            color: 'bg-yellow-100 text-yellow-800', isSystem: false },
  { value: 'cocinero',    label: 'Cocinero',          color: 'bg-purple-100 text-purple-800', isSystem: false },
];

export const getRoles = async (): Promise<RoleDefinition[]> => {
  const q = query(collection(db, COLLECTION), orderBy('label'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data() as RoleDefinition);
};

export const createRole = async (role: Omit<RoleDefinition, 'isSystem'>): Promise<void> => {
  await setDoc(doc(db, COLLECTION, role.value), { ...role, isSystem: false });
};

export const deleteRole = async (value: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, value));
};

export const seedDefaultRoles = async (): Promise<void> => {
  for (const role of DEFAULT_ROLES) {
    const ref = doc(db, COLLECTION, role.value);
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      await setDoc(ref, role);
    }
  }
  console.log('Default roles seeded successfully.');
};
