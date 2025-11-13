/**
 * Get the date range for the most recent complete week (Monday-Sunday)
 */
export function getWeekDateRange(): {
  weekStartDate: string;
  weekEndDate: string;
} {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate last Sunday
  const daysToLastSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - daysToLastSunday);
  lastSunday.setHours(0, 0, 0, 0);

  // Calculate Monday of that week
  const monday = new Date(lastSunday);
  monday.setDate(lastSunday.getDate() - 6);

  return {
    weekStartDate: monday.toISOString().split("T")[0],
    weekEndDate: lastSunday.toISOString().split("T")[0],
  };
}

/**
 * Format date range for display
 */
export function formatWeekRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}
