import { useState, useEffect, useCallback } from 'react';
import { getRoles } from '../services/roleService';
import { RoleDefinition } from '../types/auth';

export function useRoles() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      setRoles(await getRoles());
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  return { roles, loading, refetch };
}
