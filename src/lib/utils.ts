/**
 * Utility functions for Corgi Quest
 */

/**
 * Format a timestamp as relative time (e.g., "2h ago", "just now")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "just now";
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days === 1) {
    return "yesterday";
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayDate(): string {
  return formatDate(new Date());
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage (clamped between 0 and 100)
 */
export function calculatePercentage(current: number, max: number): number {
  if (max === 0) return 0;
  return clamp((current / max) * 100, 0, 100);
}

/**
 * Convert a Date object to milliseconds since epoch
 * Ensures consistent timestamp format for VR API responses
 *
 * @param date - Date object to convert
 * @returns Milliseconds since epoch (January 1, 1970 00:00:00 UTC)
 */
export function dateToMilliseconds(date: Date): number {
  return date.getTime();
}

/**
 * Convert a timestamp (number or Date) to milliseconds since epoch
 * Handles both Date objects and existing millisecond timestamps
 *
 * @param timestamp - Date object or milliseconds since epoch
 * @returns Milliseconds since epoch
 */
export function toMilliseconds(timestamp: Date | number): number {
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  return timestamp;
}

/**
 * Ensure a timestamp is in milliseconds format
 * Validates and normalizes timestamp values for VR API responses
 *
 * @param timestamp - Timestamp value to validate
 * @returns Milliseconds since epoch
 * @throws Error if timestamp is invalid
 */
export function ensureMilliseconds(timestamp: unknown): number {
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  if (typeof timestamp === "number") {
    // Validate it's a reasonable timestamp (not negative, not too far in future)
    if (timestamp < 0) {
      throw new Error("Timestamp cannot be negative");
    }
    // Check if it's in seconds (before year 2100 in seconds would be < 4102444800)
    // If so, convert to milliseconds
    if (timestamp < 4102444800) {
      return timestamp * 1000;
    }
    return timestamp;
  }

  if (typeof timestamp === "string") {
    const parsed = new Date(timestamp);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid timestamp string: ${timestamp}`);
    }
    return parsed.getTime();
  }

  throw new Error(`Invalid timestamp type: ${typeof timestamp}`);
}
