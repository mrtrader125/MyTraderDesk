// src/ai/utils/timezone.ts

/**
 * Returns a Date object representing the current time in the user's specific timezone.
 */
export const getUserLocalDate = (timeZone: string = 'UTC'): Date => {
  const now = new Date();
  const userDateStr = now.toLocaleString('en-US', { timeZone });
  return new Date(userDateStr);
};

/**
 * Checks if it is currently the weekend (Saturday or Sunday) for the specific user.
 * Crucial for locking the vault and triggering the weekend review.
 */
export const isWeekendInUserTimezone = (timeZone: string = 'UTC'): boolean => {
  const userDate = getUserLocalDate(timeZone);
  const day = userDate.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

/**
 * Gets the current hour (0-23) in the user's timezone.
 * Used by the cron job to verify if it's the correct time to send a session wrap-up or daily open message.
 */
export const getUserLocalHour = (timeZone: string = 'UTC'): number => {
  const userDate = getUserLocalDate(timeZone);
  return userDate.getHours();
};

/**
 * Determines if the user is currently in the Sunday to Monday morning prep window.
 */
export const isInPrepWindow = (timeZone: string = 'UTC'): boolean => {
  const userDate = getUserLocalDate(timeZone);
  const day = userDate.getDay();
  const hour = userDate.getHours();
  const minute = userDate.getMinutes();

  const isWeekend = day === 0 || day === 6;
  const isEarlyMonday = day === 1 && (hour < 5 || (hour === 5 && minute < 30));

  return isWeekend || isEarlyMonday;
};