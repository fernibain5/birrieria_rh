import { differenceInYears, addYears } from 'date-fns';

/**
 * LFT Art. 76 (2023 "Vacaciones Dignas" reform) day table. Display-only —
 * keep in sync with birrieria_rh_api/src/vacations/vacations.service.ts,
 * which is the server-authoritative copy that actually enforces the block.
 */
export function vacationDaysForSeniority(years: number): number {
  if (years <= 0) return 0;
  if (years <= 5) return 10 + years * 2;
  const tier = Math.ceil((years - 5) / 5);
  return 20 + tier * 2;
}

/**
 * The anniversary-year period a row's entitlement/usage is measured over.
 * `completedYears` uses the same `differenceInYears` the profile page's
 * `calculateSeniority` (src/utils/seniority.ts) already relies on, so this
 * stays consistent with the "antigüedad" shown there. Keep in sync with
 * birrieria_rh_api/src/vacations/vacations.service.ts's getAnniversaryWindow.
 */
export function getAnniversaryWindow(
  hireDate: Date,
  today: Date,
): { windowStart: Date; windowEnd: Date; completedYears: number } {
  const completedYears = Math.max(0, differenceInYears(today, hireDate));
  const windowStart = addYears(hireDate, completedYears);
  const windowEnd = addYears(hireDate, completedYears + 1);
  return { windowStart, windowEnd, completedYears };
}
