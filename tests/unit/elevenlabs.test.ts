import { describe, it, expect } from "vitest";
import { transformSpeechText } from "@/lib/services/elevenlabs";

describe("ElevenLabs utilities", () => {
  describe("transformSpeechText", () => {
    it("should add pause markers between sentences", () => {
      const input = "Take a deep breath. Exhale smiling.";
      const expected =
        'Take a deep breath. <break time="1.5s" /> Exhale smiling.';

      expect(transformSpeechText(input)).toBe(expected);
    });

    it("should handle multiple sentences with different punctuation", () => {
      const input = "Hello there! How are you? I'm doing well. Thank you.";
      const expected =
        'Hello there! <break time="1.5s" /> How are you? <break time="1.5s" /> I\'m doing well. <break time="1.5s" /> Thank you.';

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
        'First sentence. <break time="1.5s" />  Second sentence.';

      expect(transformSpeechText(input)).toBe(expected);
    });
  });
});
