import { describe, it, expect, beforeEach } from "vitest";
import * as meditationTimeline from "@/components/nada/meditationTimeline";
import { Meditation } from "@/components/nada/NadaPage";

describe("Meditation Timeline", () => {
  let sampleMeditation: Meditation;

  beforeEach(() => {
    // Reset the sample meditation before each test
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
          duration: 10,
          durationMs: 10000,
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
    it("should calculate timings correctly with gaps", () => {
      const timings = meditationTimeline.calculateTimings(
        sampleMeditation,
        3000
      );

      // Should have 5 timings: 3 steps + 2 gaps
      expect(timings).toHaveLength(5);

      // First speech
      expect(timings[0].type).toBe("speech");
      expect(timings[0].startTimeMs).toBe(0);
      expect(timings[0].endTimeMs).toBe(5000);
      expect(timings[0].isGap).toBe(false);

      // First gap
      expect(timings[1].type).toBe("gap");
      expect(timings[1].startTimeMs).toBe(5000);
      expect(timings[1].endTimeMs).toBe(8000);
      expect(timings[1].durationMs).toBe(3000);
      expect(timings[1].isGap).toBe(true);

      // Pause
      expect(timings[2].type).toBe("pause");
      expect(timings[2].startTimeMs).toBe(8000);
      expect(timings[2].endTimeMs).toBe(18000); // 8000 + 10000
      expect(timings[2].isGap).toBe(false);

      // Second gap
      expect(timings[3].type).toBe("gap");
      expect(timings[3].startTimeMs).toBe(18000);
      expect(timings[3].endTimeMs).toBe(21000);
      expect(timings[3].durationMs).toBe(3000);
      expect(timings[3].isGap).toBe(true);

      // Second speech
      expect(timings[4].type).toBe("speech");
      expect(timings[4].startTimeMs).toBe(21000);
      expect(timings[4].endTimeMs).toBe(24000); // 21000 + 3000
      expect(timings[4].isGap).toBe(false);
    });

    it("should handle non-audio steps correctly", () => {
      sampleMeditation.steps = [
        { type: "heading", text: "Welcome", level: 1, readAloud: false },
        {
          type: "speech",
          text: "Take a deep breath",
          audioFileId: "audio1",
          durationMs: 3000,
        },
        { type: "direction", text: "Sit comfortably" },
      ];

      const timings = meditationTimeline.calculateTimings(sampleMeditation);

      // Should only have 1 timing for the speech step (no gaps since it's the only audio step)
      expect(timings).toHaveLength(1);
      expect(timings[0].type).toBe("speech");
      expect(timings[0].startTimeMs).toBe(0);
      expect(timings[0].endTimeMs).toBe(3000);
      expect(timings[0].isGap).toBe(false);
    });

    it("should handle empty meditation correctly", () => {
      const emptyMeditation: Meditation = {
        title: "Empty Meditation",
        steps: [],
      };

      const timings = meditationTimeline.calculateTimings(emptyMeditation);
      expect(timings).toHaveLength(0);
    });
  });

  describe("addTimelineToMeditation", () => {
    it("should add timeline to meditation correctly", () => {
      const meditationWithTimeline = meditationTimeline.addTimelineToMeditation(
        sampleMeditation,
        3000
      );

      expect(meditationWithTimeline.timeline).toBeDefined();
      expect(meditationWithTimeline.timeline?.totalDurationMs).toBe(24000);
      expect(meditationWithTimeline.timeline?.timings).toHaveLength(5); // 3 steps + 2 gaps
    });
  });

  describe("getActiveTimingAtTime", () => {
    it("should find the correct timing at a given time", () => {
      const timings = meditationTimeline.calculateTimings(sampleMeditation);

      // First speech
      const timing1 = meditationTimeline.getActiveTimingAtTime(timings, 2500);
      expect(timing1?.type).toBe("speech");
      expect(timing1?.index).toBe(0);

      // First gap
      const gap1 = meditationTimeline.getActiveTimingAtTime(timings, 6000);
      expect(gap1?.type).toBe("gap");
      expect(gap1?.isGap).toBe(true);

      // Pause
      const timing2 = meditationTimeline.getActiveTimingAtTime(timings, 10000);
      expect(timing2?.type).toBe("pause");
      expect(timing2?.index).toBe(1);

      // Second gap
      const gap2 = meditationTimeline.getActiveTimingAtTime(timings, 19000);
      expect(gap2?.type).toBe("gap");
      expect(gap2?.isGap).toBe(true);

      // Second speech
      const timing3 = meditationTimeline.getActiveTimingAtTime(timings, 22000);
      expect(timing3?.type).toBe("speech");
      expect(timing3?.index).toBe(2);
    });
  });

  describe("getStepIndexAtTime", () => {
    it("should get the correct step index at a given time", () => {
      const timings = meditationTimeline.calculateTimings(sampleMeditation);

      // First speech
      expect(meditationTimeline.getStepIndexAtTime(timings, 2500)).toBe(0);

      // First gap (should return -1 for gaps)
      expect(meditationTimeline.getStepIndexAtTime(timings, 6000)).toBe(-1);

      // Pause
      expect(meditationTimeline.getStepIndexAtTime(timings, 10000)).toBe(1);

      // Second gap
      expect(meditationTimeline.getStepIndexAtTime(timings, 19000)).toBe(-1);

      // Second speech
      expect(meditationTimeline.getStepIndexAtTime(timings, 22000)).toBe(2);
    });
  });

  describe("getTimeForStep", () => {
    it("should get the correct time for a step", () => {
      const timings = meditationTimeline.calculateTimings(sampleMeditation);

      expect(meditationTimeline.getTimeForStep(timings, 0)).toBe(0);
      expect(meditationTimeline.getTimeForStep(timings, 1)).toBe(8000);
      expect(meditationTimeline.getTimeForStep(timings, 2)).toBe(21000);
      expect(meditationTimeline.getTimeForStep(timings, 999)).toBe(0); // Non-existent step
    });
  });

  describe("isInGap", () => {
    it("should correctly identify if a time is in a gap", () => {
      const timings = meditationTimeline.calculateTimings(sampleMeditation);

      // First speech (not in gap)
      expect(meditationTimeline.isInGap(timings, 2500)).toBe(false);

      // First gap
      expect(meditationTimeline.isInGap(timings, 6000)).toBe(true);

      // Pause (not in gap)
      expect(meditationTimeline.isInGap(timings, 10000)).toBe(false);

      // Second gap
      expect(meditationTimeline.isInGap(timings, 19000)).toBe(true);

      // Second speech (not in gap)
      expect(meditationTimeline.isInGap(timings, 22000)).toBe(false);
    });
  });
});
