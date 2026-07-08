import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserBranch } from '../types/auth';

/**
 * Generalizes ReglamentoPage's original pattern: an admin can freely pick
 * either branch, everyone else (gerente included) is hard-locked to their
 * own `userProfile.branch`.
 */
export function useBranchLock(defaultBranch: UserBranch = 'San Pedro') {
  const { isAdmin, userProfile } = useAuth();
  const ownBranch = (userProfile?.branch as UserBranch) ?? defaultBranch;

  const [selectedBranch, setSelectedBranch] = useState<UserBranch>(
    isAdmin ? defaultBranch : ownBranch,
  );

  const effectiveBranch = isAdmin ? selectedBranch : ownBranch;
  const canChooseBranch = isAdmin;

  const setBranch = (branch: UserBranch) => {
    if (isAdmin) setSelectedBranch(branch);
  };

  return { effectiveBranch, canChooseBranch, setBranch };
}
