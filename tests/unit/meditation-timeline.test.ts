import { describe, it, expect, beforeEach } from "vitest";
import * as meditationTimeline from "@/components/nada/utils/meditationTimeline";
import { Meditation } from "@/components/nada/Nada";

describe("Meditation Timeline", () => {
  let sampleMeditation: Meditation;

  beforeEach(() => {
    sampleMeditation = {
      title: "Test Meditation",
      steps: [
        {
          type: "speech",
          text: "Welcome to this meditation",
          audioFileId: "audio1",
          durationMs: 5000,
        },
        {
          type: "pause",
          duration: 3,
          durationMs: 3000,
          canExtend: false,
          waitForUserInput: false,
        },
        {
          type: "speech",
          text: "Take a deep breath",
          audioFileId: "audio2",
          durationMs: 3000,
        },
      ],
    };
  });

  describe("calculateTimings", () => {
    it("should calculate timings correctly with default gaps", () => {
      const timings = meditationTimeline.calculateTimings(sampleMeditation);

      expect(timings).toHaveLength(5); // 3 steps + 2 gaps

      // Verify structure and key timings
      expect(timings[0]).toMatchObject({
        type: "speech",
        startTimeMs: 0,
        endTimeMs: 5000,
        isGap: false,
      });

      // Default gap (2s)
      expect(timings[1]).toMatchObject({
        type: "gap",
        startTimeMs: 5000,
        endTimeMs: 7000, // 5000 + 2000 (default gap)
        durationMs: 2000,
        isGap: true,
      });

      // Last speech step
      expect(timings[4]).toMatchObject({
        type: "speech",
        startTimeMs: 12000, // 7000 + 3000 (pause) + 2000 (gap)
        endTimeMs: 15000,
        isGap: false,
      });
    });

    it("should handle longer gaps after headings", () => {
      const meditationWithHeading: Meditation = {
        title: "Test",
        steps: [
          {
            type: "speech",
            text: "First",
            durationMs: 2000,
          },
          {
            type: "heading",
            text: "Section 1",
            level: 1,
            readAloud: false,
          },
          {
            type: "speech",
            text: "After heading",
            durationMs: 2000,
          },
        ],
      };

      const timings = meditationTimeline.calculateTimings(
        meditationWithHeading
      );

      expect(timings).toHaveLength(3); // 2 speech steps + 1 gap

      // First speech
      expect(timings[0]).toMatchObject({
        type: "speech",
        startTimeMs: 0,
        endTimeMs: 2000,
      });

      // Gap after heading should be 3s
      expect(timings[1]).toMatchObject({
        type: "gap",
        startTimeMs: 2000,
        endTimeMs: 5000, // 2000 + 3000 (heading gap)
        durationMs: 3000,
        isGap: true,
      });

      // Second speech
      expect(timings[2]).toMatchObject({
        type: "speech",
        startTimeMs: 5000,
        endTimeMs: 7000,
      });
    });

    it("should handle non-audio steps", () => {
      const meditationWithNonAudio: Meditation = {
        title: "Test",
        steps: [
          { type: "heading", text: "Welcome", level: 1, readAloud: false },
          {
            type: "speech",
            text: "Hello",
            durationMs: 3000,
          },
          { type: "direction", text: "Sit comfortably" },
        ],
      };

      const timings = meditationTimeline.calculateTimings(
        meditationWithNonAudio
      );
      expect(timings).toHaveLength(1); // Only the speech step
      expect(timings[0].type).toBe("speech");
    });
  });

  describe("timeline utilities", () => {
    let timings: meditationTimeline.Timing[];

    beforeEach(() => {
      timings = meditationTimeline.calculateTimings(sampleMeditation);
    });

    it("should get correct step indices at different times", () => {
      // Test key points in timeline
      expect(meditationTimeline.getStepIndexAtTime(timings, 2500)).toBe(0); // During first step
      expect(meditationTimeline.getStepIndexAtTime(timings, 6000)).toBe(0); // In first gap
      expect(meditationTimeline.getStepIndexAtTime(timings, 9000)).toBe(1); // In second gap
    });

    it("should identify gaps correctly", () => {
      expect(meditationTimeline.isInGap(timings, 2500)).toBe(false); // During step
      expect(meditationTimeline.isInGap(timings, 6000)).toBe(true); // In gap
    });

    it("should get correct start times for steps", () => {
      expect(meditationTimeline.getTimeForStep(timings, 0)).toBe(0);
      expect(meditationTimeline.getTimeForStep(timings, 1)).toBe(7000); // After first step + default gap
      expect(meditationTimeline.getTimeForStep(timings, 2)).toBe(12000); // After second step + default gap
    });
  });
});
