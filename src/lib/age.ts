export const MINIMUM_AGE = 21;

/** Parses "YYYY-MM-DD" and rejects impossible dates such as Feb 30. */
export function parseDob(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (date.getTime() > Date.now()) return null;
  return { year, month, day };
}

/** Age in whole years today, or null when the date is not valid. */
export function ageFromDob(value: string): number | null {
  const dob = parseDob(value);
  if (!dob) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.year;
  const monthDiff = today.getMonth() + 1 - dob.month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.day)) age--;
  return age;
}

export function daysInMonth(month: number, year: number): number {
  // Without a year yet, allow Feb 29 so leap-day birthdays stay selectable
  return new Date(year || 2000, month, 0).getDate();
}
