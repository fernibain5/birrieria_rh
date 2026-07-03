import { differenceInMonths, differenceInYears } from "date-fns";

export const calculateSeniority = (hireDate?: string): string => {
  if (!hireDate) return "Sin fecha de ingreso";

  const start = new Date(`${hireDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "Sin fecha de ingreso";

  const now = new Date();
  if (start > now) return "Fecha de ingreso futura";

  const years = differenceInYears(now, start);
  const months = differenceInMonths(now, start) % 12;

  if (years === 0 && months === 0) return "Menos de 1 mes";

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "año" : "años"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "mes" : "meses"}`);

  return parts.join(" y ");
};
