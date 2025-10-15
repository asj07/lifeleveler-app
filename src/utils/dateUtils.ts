import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Get the current date in IST timezone as YYYY-MM-DD format
 */
export function getTodayIST(): string {
  return formatInTimeZone(new Date(), IST_TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Get the current date and time in IST timezone
 */
export function getNowIST(): Date {
  return toZonedTime(new Date(), IST_TIMEZONE);
}

/**
 * Format a date to IST timezone
 */
export function formatDateIST(date: Date | string, format: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, IST_TIMEZONE, format);
}

/**
 * Convert a date string to IST timezone Date object
 */
export function toISTDate(dateString: string): Date {
  return toZonedTime(new Date(dateString), IST_TIMEZONE);
}
