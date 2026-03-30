/**
 * Date Time Utilities
 * 
 * Reusable functions for date and time formatting, manipulation, and comparison.
 * Provides consistent date handling across the application.
 */

/**
 * Format date to readable string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date to short format (e.g., "01/15/2024")
 */
export function formatDateShort(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date and time (e.g., "Jan 15, 2024 at 3:30 PM")
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format time only (e.g., "3:30 PM")
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Time';
  
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const isPast = diffMs < 0;
  const absDiffSec = Math.abs(diffSec);
  const absDiffMin = Math.abs(diffMin);
  const absDiffHour = Math.abs(diffHour);
  const absDiffDay = Math.abs(diffDay);
  const absDiffWeek = Math.abs(diffWeek);
  const absDiffMonth = Math.abs(diffMonth);
  const absDiffYear = Math.abs(diffYear);

  let result = '';

  if (absDiffSec < 60) {
    result = 'just now';
  } else if (absDiffMin < 60) {
    result = `${absDiffMin} minute${absDiffMin === 1 ? '' : 's'}`;
  } else if (absDiffHour < 24) {
    result = `${absDiffHour} hour${absDiffHour === 1 ? '' : 's'}`;
  } else if (absDiffDay < 7) {
    result = `${absDiffDay} day${absDiffDay === 1 ? '' : 's'}`;
  } else if (absDiffWeek < 4) {
    result = `${absDiffWeek} week${absDiffWeek === 1 ? '' : 's'}`;
  } else if (absDiffMonth < 12) {
    result = `${absDiffMonth} month${absDiffMonth === 1 ? '' : 's'}`;
  } else {
    result = `${absDiffYear} year${absDiffYear === 1 ? '' : 's'}`;
  }

  if (result === 'just now') return result;
  return isPast ? `${result} ago` : `in ${result}`;
}

/**
 * Get start of day (00:00:00.000)
 */
export function startOfDay(date: Date | string | number = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59.999)
 */
export function endOfDay(date: Date | string | number = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date | string | number, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date | string | number, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const d = new Date(date);
  const yesterday = addDays(new Date(), -1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string | number): boolean {
  const d = new Date(date);
  const tomorrow = addDays(new Date(), 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  return new Date(date).getTime() < new Date().getTime();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  return new Date(date).getTime() > new Date().getTime();
}

/**
 * Check if date is within range
 */
export function isWithinRange(
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number
): boolean {
  const d = new Date(date).getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return d >= s && d <= e;
}

/**
 * Get difference between two dates in days
 */
export function getDaysDifference(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get difference between two dates in hours
 */
export function getHoursDifference(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60));
}

/**
 * Get difference between two dates in minutes
 */
export function getMinutesDifference(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Format duration in milliseconds to readable string (e.g., "2h 30m", "45s")
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get age from birthdate
 */
export function getAge(birthDate: Date | string | number): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get day name (e.g., "Monday")
 */
export function getDayName(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get month name (e.g., "January")
 */
export function getMonthName(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'long' });
}

/**
 * Parse ISO date string safely
 */
export function parseISODate(dateString: string): Date | null {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

/**
 * Convert to ISO string safely
 */
export function toISOString(date: Date | string | number): string | null {
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
}

/**
 * Format for API submission (ISO string)
 */
export function formatForAPI(date: Date | string | number): string {
  return new Date(date).toISOString();
}

export default {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  startOfDay,
  endOfDay,
  addDays,
  addHours,
  addMinutes,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isWithinRange,
  getDaysDifference,
  getHoursDifference,
  getMinutesDifference,
  formatDuration,
  getAge,
  getDayName,
  getMonthName,
  parseISODate,
  toISOString,
  formatForAPI,
};
