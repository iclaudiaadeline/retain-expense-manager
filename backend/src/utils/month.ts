/** The current calendar month as YYYY-MM, in UTC. */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** The first day of the month and the first day of the next one, for "date >= start AND date < end" filters. */
export function monthRange(month: string): { start: Date; end: Date } {
  const [year, monthNumber] = month.split("-").map(Number) as [number, number];
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
}
