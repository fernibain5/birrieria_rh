export const formatFullName = (
  displayName?: string | null,
  lastName?: string | null,
): string => [displayName, lastName].filter(Boolean).join(' ');
