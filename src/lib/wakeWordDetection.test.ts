/**
 * Unit tests for wake word detection utility
 */

import { describe, it, expect } from "vitest";
import { detectWakeWord } from "./wakeWordDetection";

describe("detectWakeWord", () => {
  describe("wake word detection", () => {
    it('should detect "hey bumi" (lowercase)', () => {
      const result = detectWakeWord("hey bumi stayed calm when bike passed");

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("stayed calm when bike passed");
      expect(result.wakeWord).toBe("hey bumi");
      expect(result.startIndex).toBe(0);
    });

    it('should detect "Hey Bumi" (capitalized)', () => {
      const result = detectWakeWord("Hey Bumi good recall at park");

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("good recall at park");
      expect(result.wakeWord).toBe("hey bumi");
    });

    it('should detect "HEY BUMI" (uppercase)', () => {
      const result = detectWakeWord("HEY BUMI 30 minute walk");

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("30 minute walk");
      expect(result.wakeWord).toBe("hey bumi");
    });

    it('should detect "hey, bumi" variation', () => {
      const result = detectWakeWord("hey, bumi met three new dogs");

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("met three new dogs");
      expect(result.wakeWord).toBe("hey, bumi");
    });

    it('should detect "hey boomi" variation (common misrecognition)', () => {
      const result = detectWakeWord("hey boomi practiced sit command");

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("practiced sit command");
      expect(result.wakeWord).toBe("hey boomi");
    });
  });

  describe("payload extraction", () => {
    it("should extract payload after wake word", () => {
      const result = detectWakeWord("hey bumi stayed calm around loud noises");

      expect(result.payload).toBe("stayed calm around loud noises");
    });

    it("should handle wake word in middle of transcript", () => {
      const result = detectWakeWord(
        "hello there hey bumi walked for 20 minutes"
      );

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("walked for 20 minutes");
      expect(result.startIndex).toBeGreaterThan(0);
    });

    it("should remove leading punctuation from payload", () => {
      const result = detectWakeWord("hey bumi, stayed calm");

      expect(result.payload).toBe("stayed calm");
    });

    it("should remove leading colon from payload", () => {
      const result = detectWakeWord("hey bumi: good behavior");

      expect(result.payload).toBe("good behavior");
    });

    it("should remove multiple leading punctuation marks", () => {
      const result = detectWakeWord("hey bumi:, practiced recall");

      expect(result.payload).toBe("practiced recall");
    });

    it("should trim whitespace from payload", () => {
      const result = detectWakeWord("hey bumi    lots of spaces    here");

      expect(result.payload).toBe("lots of spaces    here");
    });

    it("should handle empty payload", () => {
      const result = detectWakeWord("hey bumi");

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("");
    });

    it("should handle payload with only punctuation", () => {
      const result = detectWakeWord("hey bumi, . : ;");

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("");
    });
  });

  describe("no wake word detected", () => {
    it("should not detect wake word when not present", () => {
      const result = detectWakeWord("just walking my dog");

      expect(result.detected).toBe(false);
      expect(result.payload).toBe("");
      expect(result.wakeWord).toBe("");
      expect(result.startIndex).toBe(-1);
      expect(result.endIndex).toBe(-1);
    });

    it("should not detect partial wake word", () => {
      const result = detectWakeWord("hey there buddy");

      expect(result.detected).toBe(false);
    });

    it("should handle empty string", () => {
      const result = detectWakeWord("");

      expect(result.detected).toBe(false);
      expect(result.payload).toBe("");
    });
  });

  describe("edge cases", () => {
    it("should detect wake word at end of transcript", () => {
      const result = detectWakeWord("hello there hey bumi");

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("");
    });

    it("should detect first occurrence when wake word appears multiple times", () => {
      const result = detectWakeWord(
        "hey bumi first activity hey bumi second activity"
      );

      expect(result.detected).toBe(true);
      expect(result.payload).toBe("first activity hey bumi second activity");
      expect(result.startIndex).toBe(0);
    });

    it("should preserve case in payload", () => {
      const result = detectWakeWord("hey bumi Stayed Calm Around BIKES");

      expect(result.payload).toBe("Stayed Calm Around BIKES");
    });

    it("should handle special characters in payload", () => {
      const result = detectWakeWord("hey bumi walked 2.5 miles @ 3pm!");

      expect(result.payload).toBe("walked 2.5 miles @ 3pm!");
    });
  });
});
