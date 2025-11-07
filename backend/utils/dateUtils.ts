/**
 * Date Utilities (DRY)
 * Common date/time operations
 */

import { format, parseISO, isValid, addDays, subDays, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Format date to Turkish locale
 */
export const formatDate = (date: Date | string, formatString = 'dd.MM.yyyy') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: tr });
};

/**
 * Format date and time
 */
export const formatDateTime = (date: Date | string) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

/**
 * Check if date is valid
 */
export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d);
};

/**
 * Add days to date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

/**
 * Subtract days from date
 */
export const subDaysFromDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subDays(dateObj, days);
};

/**
 * Calculate days difference
 */
export const daysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d1, d2);
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj > new Date();
};
