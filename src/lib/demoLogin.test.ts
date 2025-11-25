/**
 * Tests for demo login utilities
 * Validates auto-login flow configuration
 */

import { describe, it, expect } from "vitest";
import { getDemoConfig } from "./demoLogin";

describe("Demo Login Utilities", () => {
  describe("getDemoConfig", () => {
    it("should return demo configuration with email", () => {
      const config = getDemoConfig();
      expect(config).toHaveProperty("email");
      expect(typeof config.email).toBe("string");
      expect(config.email.length).toBeGreaterThan(0);
    });

    it("should return a valid email format", () => {
      const config = getDemoConfig();
      expect(config.email).toContain("@");
      expect(config.email).toContain(".");
    });
  });
});
