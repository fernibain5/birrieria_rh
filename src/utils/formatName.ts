export const formatFullName = (
  displayName?: string | null,
  lastName?: string | null,
): string => [displayName, lastName].filter(Boolean).join(' ');

export const formatLastNameFirst = (
  displayName?: string | null,
  lastName?: string | null,
): string => [lastName, displayName].filter(Boolean).join(' ');

/**
 * Sorts entries with a last name ascending by last name (then first name to
 * break ties), and puts entries with no last name below all of those.
 */
export const compareByLastNameFirst = (
  a: { displayName?: string | null; lastName?: string | null },
  b: { displayName?: string | null; lastName?: string | null },
): number => {
  const aHasLastName = !!a.lastName;
  const bHasLastName = !!b.lastName;
  if (aHasLastName !== bHasLastName) return aHasLastName ? -1 : 1;
  if (aHasLastName && bHasLastName) {
    return a.lastName!.localeCompare(b.lastName!) || (a.displayName ?? '').localeCompare(b.displayName ?? '');
  }
  return (a.displayName ?? '').localeCompare(b.displayName ?? '');
};
