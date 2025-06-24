import { describe, it, expect } from "vitest";
import {
  transformSpeechText,
  getWeeklyMeditationsLeft,
} from "@/lib/services/elevenlabs";

describe("ElevenLabs utilities", () => {
  describe("transformSpeechText", () => {
    it("should add pause markers between sentences", () => {
      const input = "Take a deep breath. Exhale smiling.";
      const expected =
        'Take a deep breath. <break time="1.2s" /> Exhale smiling.';

      expect(transformSpeechText(input)).toBe(expected);
    });

    it("should handle multiple sentences with different punctuation", () => {
      const input = "Hello there! How are you? I'm doing well. Thank you.";
      const expected =
        'Hello there! <break time="1.2s" /> How are you? <break time="1.2s" /> I\'m doing well. <break time="1.2s" /> Thank you.';

      expect(transformSpeechText(input)).toBe(expected);
    });

    it("should not add a pause marker at the end of text", () => {
      const input = "This is a complete sentence.";
      const expected = "This is a complete sentence.";

      expect(transformSpeechText(input)).toBe(expected);
    });

    it("should handle text without sentence endings", () => {
      const input = "Just a phrase without ending punctuation";
      const expected = "Just a phrase without ending punctuation";

      expect(transformSpeechText(input)).toBe(expected);
    });

    it("should handle empty text", () => {
      expect(transformSpeechText("")).toBe("");
    });

    it("should handle sentences with multiple spaces between them", () => {
      const input = "First sentence.  Second sentence.";
      const expected =
        'First sentence. <break time="1.2s" />  Second sentence.';

      expect(transformSpeechText(input)).toBe(expected);
    });
  });

  describe("getWeeklyMeditationsLeft", () => {
    function createMockClient(subscriptionData: any) {
      return {
        user: {
          subscription: {
            get: async () => subscriptionData,
          },
        },
      } as any;
    }

    it("should return 1 meditation left for week 2 with unused credits", async () => {
      const now = Date.now();
      const resetTime = now + 14 * 24 * 60 * 60 * 1000; // 14 days from now = week 2

      const mockClient = createMockClient({
        characterCount: 0,
        characterLimit: 8000,
        nextCharacterCountResetUnix: Math.floor(resetTime / 1000),
      });

      const result = await getWeeklyMeditationsLeft({ client: mockClient });
      expect(result).toBe(1); // Week 2: no usage, full 2000 credit quota = 1 meditation
    });

    it("should return 0 meditations for week 2 with partial usage", async () => {
      const now = Date.now();
      const resetTime = now + 14 * 24 * 60 * 60 * 1000; // 14 days from now = week 2

      const mockClient = createMockClient({
        characterCount: 5500, // 2000 + 2000 + 1500 (weeks 0, 1, and partial week 2)
        characterLimit: 8000,
        nextCharacterCountResetUnix: Math.floor(resetTime / 1000),
      });

      const result = await getWeeklyMeditationsLeft({ client: mockClient });
      // Week 2: creditsPerWeek = 2000, creditsUsedByStartOfWeek = 4000, creditsUsedThisWeek = 1500
      // creditsLeftThisWeek = 2000 - 1500 = 500, 500 < 2000, so 0 meditations
      expect(result).toBe(0);
    });

    it("should calculate correctly for week 1", async () => {
      const now = Date.now();
      const resetTime = now + 21 * 24 * 60 * 60 * 1000; // 21 days from now = week 1

      const mockClient = createMockClient({
        characterCount: 2500, // Used 2000 in week 0, 500 in week 1
        characterLimit: 8000,
        nextCharacterCountResetUnix: Math.floor(resetTime / 1000),
      });

      const result = await getWeeklyMeditationsLeft({ client: mockClient });
      // Week 1: creditsPerWeek = 2000, creditsUsedByStartOfWeek = 2000, creditsUsedThisWeek = 500
      // creditsLeftThisWeek = 2000 - 500 = 1500, 1500 < 2000, so 0 meditations
      expect(result).toBe(0);
    });

    it("should return 0 when over weekly quota", async () => {
      const now = Date.now();
      const resetTime = now + 28 * 24 * 60 * 60 * 1000; // 28 days from now = week 0

      const mockClient = createMockClient({
        characterCount: 3000, // Way over first week quota
        characterLimit: 8000,
        nextCharacterCountResetUnix: Math.floor(resetTime / 1000),
      });

      const result = await getWeeklyMeditationsLeft({ client: mockClient });
      expect(result).toBe(0);
    });

    it("should handle week 3 correctly", async () => {
      const now = Date.now();
      const resetTime = now + 7 * 24 * 60 * 60 * 1000; // 7 days from now = week 3

      const mockClient = createMockClient({
        characterCount: 6000, // Perfect usage: 2000 each for weeks 0, 1, 2
        characterLimit: 8000,
        nextCharacterCountResetUnix: Math.floor(resetTime / 1000),
      });

      const result = await getWeeklyMeditationsLeft({ client: mockClient });
      expect(result).toBe(1); // Full week 3 quota available: 2000 credits = 1 meditation
    });

    it("should return 0 when API call fails", async () => {
      // Suppress console.error for this test since we're intentionally testing error handling
      const originalConsoleError = console.error;
      console.error = () => {};

      const mockClient = {
        user: {
          subscription: {
            get: async () => {
              throw new Error("API Error");
            },
          },
        },
      } as any;

      const result = await getWeeklyMeditationsLeft({ client: mockClient });
      expect(result).toBe(0);

      // Restore console.error
      console.error = originalConsoleError;
    });

    it("should handle missing reset time gracefully", async () => {
      const mockClient = createMockClient({
        characterCount: 1000,
        characterLimit: 8000,
        nextCharacterCountResetUnix: undefined,
      });

      const result = await getWeeklyMeditationsLeft({ client: mockClient });
      // When resetTimeMs is 0, it causes timeElapsedInCycleMs to be very large
      // which puts us in week 3, so we get 1 meditation
      expect(result).toBe(1);
    });
  });
});
