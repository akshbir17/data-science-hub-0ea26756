export type ISTDateParts = {
  year: number;
  month: number;
  day: number;
};

const IST_TIME_ZONE = 'Asia/Kolkata';

// Returns YYYY-MM-DD in IST
export const getISTDateKey = (date: Date = new Date()): string => {
  // en-CA reliably formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const getISTDateParts = (date: Date = new Date()): ISTDateParts => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  ) as Record<string, string>;

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
};

export const getMsUntilNextMidnightIST = (date: Date = new Date()): number => {
  const { year, month, day } = getISTDateParts(date);

  // Next 00:00 IST converted to UTC by subtracting +05:30.
  const nextMidnightUtcMs = Date.UTC(year, month - 1, day + 1, -5, -30, 0, 0);
  return nextMidnightUtcMs - date.getTime();
};
