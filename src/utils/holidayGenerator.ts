import { Event } from '../types/Event';
import { UserBranch } from '../types/auth';

// Helper function to get the nth occurrence of a weekday in a month
const getNthWeekdayOfMonth = (year: number, month: number, weekday: number, n: number): Date => {
  // weekday: 0 = Sunday, 1 = Monday, etc.
  // month: 0 = January, 1 = February, etc.
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  
  // Calculate days to add to get to the first occurrence of the desired weekday
  let daysToAdd = (weekday - firstWeekday + 7) % 7;
  
  // Add weeks to get to the nth occurrence
  daysToAdd += (n - 1) * 7;
  
  return new Date(year, month, 1 + daysToAdd);
};

const ALL_BRANCHES: UserBranch[] = ['San Pedro', 'Las Quintas'];

// Generate Mexican holidays for a specific year and branch
export const generateMexicanHolidays = (year: number, branch: UserBranch): Omit<Event, 'id'>[] => {
  const base = { type: 'holiday' as const, year, createdAt: new Date(), targetBranch: branch };

  const constitutionDay = getNthWeekdayOfMonth(year, 1, 1, 1);
  const benitojuarezDay = getNthWeekdayOfMonth(year, 2, 1, 3);
  const revolutionDay   = getNthWeekdayOfMonth(year, 10, 1, 3);

  return [
    { ...base, title: 'Año Nuevo',                    description: 'Celebración del inicio del nuevo año',                                              date: new Date(year, 0, 1),  color: 'bg-red-100 text-red-800'    },
    { ...base, title: 'Aniversario de la Constitución', description: 'Conmemoración de la Constitución Política de los Estados Unidos Mexicanos',         date: constitutionDay,        color: 'bg-blue-100 text-blue-800'  },
    { ...base, title: 'Natalicio de Benito Juárez',   description: 'Conmemoración del nacimiento de Benito Juárez',                                      date: benitojuarezDay,        color: 'bg-green-100 text-green-800'},
    { ...base, title: 'Día del Trabajo',               description: 'Celebración del Día Internacional de los Trabajadores',                              date: new Date(year, 4, 1),  color: 'bg-yellow-100 text-yellow-800'},
    { ...base, title: 'Día de la Independencia',       description: 'Conmemoración de la Independencia de México',                                        date: new Date(year, 8, 16), color: 'bg-green-100 text-green-800'},
    { ...base, title: 'Aniversario de la Revolución',  description: 'Conmemoración del inicio de la Revolución Mexicana',                                 date: revolutionDay,          color: 'bg-purple-100 text-purple-800'},
    { ...base, title: 'Navidad',                       description: 'Celebración del nacimiento de Jesucristo',                                           date: new Date(year, 11, 25), color: 'bg-red-100 text-red-800'   },
  ];
};

// Generate holidays for all branches for a specific year
export const generateMexicanHolidaysAllBranches = (year: number): Omit<Event, 'id'>[] =>
  ALL_BRANCHES.flatMap(branch => generateMexicanHolidays(year, branch));

// Generate holidays for multiple years (all branches)
export const generateHolidaysForYears = (startYear: number, endYear: number): Omit<Event, 'id'>[] => {
  const allHolidays: Omit<Event, 'id'>[] = [];
  for (let year = startYear; year <= endYear; year++) {
    allHolidays.push(...generateMexicanHolidaysAllBranches(year));
  }
  return allHolidays;
};

// Get current year and next year holidays for all branches (useful for initial setup)
export const getCurrentAndNextYearHolidays = (): Omit<Event, 'id'>[] => {
  const currentYear = new Date().getFullYear();
  return generateHolidaysForYears(currentYear, currentYear + 1);
}; 