import { useState, useEffect } from 'react';
import { getRoles } from '../services/roleService';
import { RoleDefinition } from '../types/auth';

export function useRoles() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { roles, loading };
}
