/**
 * Utility functions for handling timezone conversions in contracts
 * All dates should be converted to UTC-7 (Mexico Pacific Time)
 */

/**
 * Converts a date string to UTC-7 timezone
 * @param dateString - The date string from the input field (YYYY-MM-DD format)
 * @returns ISO string adjusted to UTC-7 timezone
 */
export const convertToUTCMinus7 = (dateString: string): string => {
  if (!dateString) return '';
  
  // Create a date object from the input string
  // The input is typically in YYYY-MM-DD format
  const inputDate = new Date(dateString);
  
  // Add 7 hours to convert from UTC to UTC-7
  // Note: We add because UTC-7 means 7 hours behind UTC
  const utcMinus7Date = new Date(inputDate.getTime() + (7 * 60 * 60 * 1000));
  
  return utcMinus7Date.toISOString();
};

/**
 * Converts a date from UTC-7 back to a date string for display in forms
 * @param isoString - ISO string in UTC-7 timezone
 * @returns Date string in YYYY-MM-DD format for input fields
 */
export const convertFromUTCMinus7ToDateString = (isoString: string): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  // Subtract 7 hours to convert from UTC-7 back to UTC for display
  const displayDate = new Date(date.getTime() - (7 * 60 * 60 * 1000));
  
  // Return in YYYY-MM-DD format for input fields
  return displayDate.toISOString().split('T')[0];
};

/**
 * Converts a time string to UTC-7 timezone
 * @param timeString - The time string from the input field (HH:MM format)
 * @param dateContext - The date context for proper timezone conversion
 * @returns Time string adjusted to UTC-7 timezone
 */
export const convertTimeToUTCMinus7 = (timeString: string, dateContext?: string): string => {
  if (!timeString) return '';
  
  // If we have a date context, use it; otherwise use today
  const baseDate = dateContext ? new Date(dateContext) : new Date();
  
  // Parse the time string (HH:MM)
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a new date with the specified time
  const dateWithTime = new Date(baseDate);
  dateWithTime.setHours(hours, minutes, 0, 0);
  
  // Convert to UTC-7
  const utcMinus7Time = new Date(dateWithTime.getTime() + (7 * 60 * 60 * 1000));
  
  // Return in HH:MM format
  return utcMinus7Time.toTimeString().slice(0, 5);
};

/**
 * Formats a date for display in contracts (Spanish format)
 * @param dateString - Date string or ISO string
 * @returns Formatted date string in Spanish format
 */
export const formatDateForContract = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Adjust to UTC-7 for display
  const displayDate = new Date(date.getTime() - (7 * 60 * 60 * 1000));
  
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const day = displayDate.getDate();
  const month = months[displayDate.getMonth()];
  const year = displayDate.getFullYear();
  
  return `${day} de ${month} de ${year}`;
};

/**
 * Extracts date parts from UTC-7 adjusted date for contract generation
 * @param isoString - The ISO string stored in the form data
 * @returns Object with day, month (in Spanish uppercase), and year
 */
export const extractDatePartsUTC7 = (isoString: string) => {
  if (!isoString) return null;
  
  const date = new Date(isoString);
  
  // Adjust to UTC-7 for display
  const displayDate = new Date(date.getTime() - (7 * 60 * 60 * 1000));
  
  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  
  return {
    day: displayDate.getDate().toString(),
    month: months[displayDate.getMonth()],
    year: displayDate.getFullYear().toString()
  };
};

/**
 * Gets the current date in UTC-7 timezone
 * @returns Current date string in YYYY-MM-DD format adjusted to UTC-7
 */
export const getCurrentDateUTCMinus7 = (): string => {
  const now = new Date();
  // Convert current time to UTC-7
  const utcMinus7Now = new Date(now.getTime() - (7 * 60 * 60 * 1000));
  return utcMinus7Now.toISOString().split('T')[0];
};
