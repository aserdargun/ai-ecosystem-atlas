export const freshnessValues = ["current", "aging", "stale"] as const;

export type Freshness = (typeof freshnessValues)[number];

const millisecondsPerDay = 24 * 60 * 60 * 1000;

function toUtcCalendarDay(value: string | Date): number {
  if (typeof value === "string") {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  }

  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

export function classifyFreshness(
  verifiedAt: string,
  now: Date = new Date(),
): Freshness {
  const ageInDays = Math.max(
    0,
    Math.floor((toUtcCalendarDay(now) - toUtcCalendarDay(verifiedAt)) / millisecondsPerDay),
  );

  if (ageInDays <= 90) {
    return "current";
  }

  if (ageInDays <= 180) {
    return "aging";
  }

  return "stale";
}
