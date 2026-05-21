import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { RoleDefinition } from '../types/auth';

export function useRoles() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'roles'), orderBy('label'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRoles(snapshot.docs.map(d => d.data() as RoleDefinition));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsubscribe;
  }, []);

  return { roles, loading };
}
