export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];