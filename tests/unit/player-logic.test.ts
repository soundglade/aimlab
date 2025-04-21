import { describe, it, expect } from "vitest";
import { optimizeStepsForPlayer } from "@/components/reader/player-logic";
import type { ReadingStep, PlayerStep } from "@/components/types";

describe("optimizeStepsForPlayer", () => {
  it("filters out headings", () => {
    const steps: ReadingStep[] = [
      { type: "heading", text: "Intro", completed: true },
      { type: "speech", text: "Hello", completed: true },
    ];
    const result = optimizeStepsForPlayer(steps);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("speech");
  });

  it("filters out uncompleted steps", () => {
    const steps: ReadingStep[] = [
      { type: "speech", text: "A", completed: false },
      { type: "speech", text: "B", completed: true },
    ];
    const result = optimizeStepsForPlayer(steps);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("speech");
    if (result[0].type === "speech") {
      expect(result[0].text).toBe("B");
    }
  });

  it("assigns correct originalIdx to each step", () => {
    const steps: ReadingStep[] = [
      { type: "speech", text: "A", completed: true },
      { type: "speech", text: "B", completed: true },
    ];
    const result = optimizeStepsForPlayer(steps);
    const speeches = result.filter((s) => s.type === "speech");
    expect(speeches[0].originalIdx).toBe(0);
    expect(speeches[1].originalIdx).toBe(1);
  });

  it("returns empty array if all steps are filtered out", () => {
    const steps: ReadingStep[] = [
      { type: "heading", text: "Intro", completed: false },
      { type: "heading", text: "Section", completed: false },
    ];
    const result = optimizeStepsForPlayer(steps);
    expect(result).toHaveLength(0);
  });
});

describe("optimizeStepsForPlayer gaps", () => {
  it("inserts 2s gaps between consecutive speech steps", () => {
    const steps: ReadingStep[] = [
      { type: "speech", text: "A", completed: true },
      { type: "speech", text: "B", completed: true },
      { type: "speech", text: "C", completed: true },
    ];
    const result = optimizeStepsForPlayer(steps);
    expect(result).toHaveLength(5);
    expect(result[1]).toMatchObject({
      type: "gap",
      duration: 2,
      audio: "silence-2s.mp3",
    });
    expect(result[3]).toMatchObject({
      type: "gap",
      duration: 2,
      audio: "silence-2s.mp3",
    });
    expect(result[1].originalIdx).toBe(0);
    expect(result[3].originalIdx).toBe(1);
  });

  it("inserts 3s gap before heading, not before pause", () => {
    const steps: ReadingStep[] = [
      { type: "speech", text: "A", completed: true },
      { type: "heading", text: "Section", completed: true },
      { type: "speech", text: "B", completed: true },
    ];
    const result = optimizeStepsForPlayer(steps);
    // speech, gap, speech
    expect(result).toHaveLength(3);
    expect(result[1]).toMatchObject({
      type: "gap",
      duration: 3,
      audio: "silence-3s.mp3",
    });
    expect(result[1].originalIdx).toBe(0);
  });

  it("does not insert gap before or after pause", () => {
    const steps: ReadingStep[] = [
      { type: "speech", text: "A", completed: true },
      { type: "pause", duration: 5, completed: true },
      { type: "speech", text: "B", completed: true },
    ];
    const result = optimizeStepsForPlayer(steps);
    // speech, pause, speech
    expect(result).toHaveLength(3);
    expect(result.some((s) => s.type === "gap")).toBe(false);
  });

  it("does not insert gaps if all steps are pauses or headings", () => {
    const steps: ReadingStep[] = [
      { type: "pause", duration: 5, completed: true },
      { type: "heading", text: "Section", completed: true },
    ];
    const result = optimizeStepsForPlayer(steps);
    expect(result.some((s) => s.type === "gap")).toBe(false);
  });

  it("gaps are not filtered by completed", () => {
    const steps: ReadingStep[] = [
      { type: "speech", text: "A", completed: true },
      { type: "speech", text: "B", completed: false },
      { type: "speech", text: "C", completed: true },
    ];
    const result = optimizeStepsForPlayer(steps);
    // Only completed speeches and gaps between them
    expect(result.filter((s) => s.type === "speech")).toHaveLength(2);
    expect(result.filter((s) => s.type === "gap")).toHaveLength(1);
  });
});
