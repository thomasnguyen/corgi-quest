/**
 * Validation utilities for VR API data formats
 * Ensures consistency with Swift VRDogStatus and VoiceLogResponse structs
 */

/**
 * Valid stat type codes matching Swift enum
 */
export const VALID_STAT_TYPES = ["PHY", "INT", "IMP", "SOC"] as const;
export type StatType = (typeof VALID_STAT_TYPES)[number];

/**
 * Validate that a stat type is one of the valid three-letter codes
 *
 * @param statType - Stat type to validate
 * @returns True if valid, false otherwise
 */
export function isValidStatType(statType: string): statType is StatType {
  return VALID_STAT_TYPES.includes(statType as StatType);
}

/**
 * Ensure a stat type is valid, throwing an error if not
 *
 * @param statType - Stat type to validate
 * @returns The validated stat type
 * @throws Error if stat type is invalid
 */
export function ensureValidStatType(statType: string): StatType {
  if (!isValidStatType(statType)) {
    throw new Error(
      `Invalid stat type: ${statType}. Must be one of: ${VALID_STAT_TYPES.join(", ")}`
    );
  }
  return statType;
}

/**
 * Normalize stat type to ensure it's in the correct format
 * Handles common variations and returns the canonical three-letter code
 *
 * @param statType - Stat type to normalize (can be full name or code)
 * @returns Normalized three-letter stat type code
 * @throws Error if stat type cannot be normalized
 */
export function normalizeStatType(statType: string): StatType {
  const upper = statType.toUpperCase().trim();

  // Direct match
  if (isValidStatType(upper)) {
    return upper;
  }

  // Map full names to codes
  const nameToCode: Record<string, StatType> = {
    PHYSICAL: "PHY",
    INTELLIGENCE: "INT",
    "IMPULSE CONTROL": "IMP",
    IMPULSE: "IMP",
    SOCIALIZATION: "SOC",
    SOCIAL: "SOC",
  };

  const normalized = nameToCode[upper];
  if (normalized) {
    return normalized;
  }

  throw new Error(
    `Cannot normalize stat type: ${statType}. Must be one of: ${VALID_STAT_TYPES.join(", ")} or their full names`
  );
}

/**
 * Validate an array of stat types
 *
 * @param statTypes - Array of stat types to validate
 * @returns True if all are valid
 * @throws Error if any stat type is invalid
 */
export function validateStatTypes(statTypes: string[]): boolean {
  for (const statType of statTypes) {
    ensureValidStatType(statType);
  }
  return true;
}

/**
 * Validate stat breakdown structure for XP awards
 * Ensures all stat types are valid and amounts are positive
 *
 * @param breakdown - Array of stat/amount pairs
 * @returns True if valid
 * @throws Error if invalid
 */
export function validateStatBreakdown(
  breakdown: Array<{ stat: string; amount: number }>
): boolean {
  if (!Array.isArray(breakdown)) {
    throw new Error("Stat breakdown must be an array");
  }

  for (const entry of breakdown) {
    if (!entry.stat || typeof entry.stat !== "string") {
      throw new Error("Each stat breakdown entry must have a stat string");
    }

    if (typeof entry.amount !== "number" || entry.amount < 0) {
      throw new Error(
        "Each stat breakdown entry must have a non-negative amount"
      );
    }

    ensureValidStatType(entry.stat);
  }

  return true;
}
