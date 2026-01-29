import { Event } from '../types/Event';

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

// Generate Mexican holidays for a specific year
export const generateMexicanHolidays = (year: number): Omit<Event, 'id'>[] => {
  const holidays: Omit<Event, 'id'>[] = [];

  // 1 de enero: Año Nuevo (fixed date)
  holidays.push({
    title: 'Año Nuevo',
    description: 'Celebración del inicio del nuevo año',
    date: new Date(year, 0, 1), // January 1st
    color: 'bg-red-100 text-red-800',
    type: 'holiday',
    year: year,
    createdAt: new Date(),
  });

  // 3 de febrero: Aniversario de la Constitución (first Monday of February)
  const constitutionDay = getNthWeekdayOfMonth(year, 1, 1, 1); // First Monday of February
  holidays.push({
    title: 'Aniversario de la Constitución',
    description: 'Conmemoración de la Constitución Política de los Estados Unidos Mexicanos',
    date: constitutionDay,
    color: 'bg-blue-100 text-blue-800',
    type: 'holiday',
    year: year,
    createdAt: new Date(),
  });

  // 17 de marzo: Natalicio de Benito Juárez (third Monday of March)
  const benitorJuarezDay = getNthWeekdayOfMonth(year, 2, 1, 3); // Third Monday of March
  holidays.push({
    title: 'Natalicio de Benito Juárez',
    description: 'Conmemoración del nacimiento de Benito Juárez',
    date: benitorJuarezDay,
    color: 'bg-green-100 text-green-800',
    type: 'holiday',
    year: year,
    createdAt: new Date(),
  });

  // 1 de mayo: Día del Trabajo (fixed date)
  holidays.push({
    title: 'Día del Trabajo',
    description: 'Celebración del Día Internacional de los Trabajadores',
    date: new Date(year, 4, 1), // May 1st
    color: 'bg-yellow-100 text-yellow-800',
    type: 'holiday',
    year: year,
    createdAt: new Date(),
  });

  // 16 de septiembre: Día de la Independencia (fixed date)
  holidays.push({
    title: 'Día de la Independencia',
    description: 'Conmemoración de la Independencia de México',
    date: new Date(year, 8, 16), // September 16th
    color: 'bg-green-100 text-green-800',
    type: 'holiday',
    year: year,
    createdAt: new Date(),
  });

  // 17 de noviembre: Aniversario de la Revolución (third Monday of November)
  const revolutionDay = getNthWeekdayOfMonth(year, 10, 1, 3); // Third Monday of November
  holidays.push({
    title: 'Aniversario de la Revolución',
    description: 'Conmemoración del inicio de la Revolución Mexicana',
    date: revolutionDay,
    color: 'bg-purple-100 text-purple-800',
    type: 'holiday',
    year: year,
    createdAt: new Date(),
  });

  // 25 de diciembre: Navidad (fixed date)
  holidays.push({
    title: 'Navidad',
    description: 'Celebración del nacimiento de Jesucristo',
    date: new Date(year, 11, 25), // December 25th
    color: 'bg-red-100 text-red-800',
    type: 'holiday',
    year: year,
    createdAt: new Date(),
  });

  return holidays;
};

// Generate holidays for multiple years
export const generateHolidaysForYears = (startYear: number, endYear: number): Omit<Event, 'id'>[] => {
  const allHolidays: Omit<Event, 'id'>[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    const yearHolidays = generateMexicanHolidays(year);
    allHolidays.push(...yearHolidays);
  }
  
  return allHolidays;
};

// Get current year and next year holidays (useful for initial setup)
export const getCurrentAndNextYearHolidays = (): Omit<Event, 'id'>[] => {
  const currentYear = new Date().getFullYear();
  return generateHolidaysForYears(currentYear, currentYear + 1);
}; 