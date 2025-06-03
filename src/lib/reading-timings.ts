import type { PlayerStep } from "@/components/types";

// Helper to create a gap step for PlayerStep
function makeGap(duration: number, originalIdx: number): PlayerStep {
  return {
    type: "gap",
    duration,
    audio: `assets/silence-${duration}-seconds.mp3`,
    originalIdx,
  };
}

// Helper to create a meditation bell step for PlayerStep
function makeBell(originalIdx: number): PlayerStep {
  return {
    type: "sound",
    duration: 2,
    audio: "assets/ending-bell-wp50.mp3",
    originalIdx,
  };
}

// Accepts ReadingStep[] and outputs PlayerStep[]
export function optimizeStepsForPlayer(
  readingSteps: import("@/components/types").ReadingStep[],
  completed?: boolean,
  bellEnabled: boolean = true
): PlayerStep[] {
  // Filter for completed steps only, keep original index
  const steps =
    readingSteps
      ?.map((s, idx) => ({ ...s, originalIdx: idx }))
      .filter((s) => s.completed) ?? [];
  if (steps.length === 0) return [];

  const result: PlayerStep[] = [];
  for (let i = 0; i < steps.length; i++) {
    const curr = steps[i];
    // Only include playable steps (speech, pause)
    if (curr.type === "speech") {
      result.push({
        type: "speech",
        text: curr.text,
        audio: curr.audio,
        originalIdx: curr.originalIdx,
      });
    } else if (curr.type === "pause") {
      result.push({
        type: "pause",
        duration: curr.duration,
        audio: curr.audio,
        originalIdx: curr.originalIdx,
      });
    }
    const next = steps[i + 1];
    if (!next) continue;
    if (curr.type === "pause" || next.type === "pause") continue;
    // Only insert gaps between speeches or before a heading in the original ReadingStep
    if (next.type === "heading") {
      result.push(makeGap(3, curr.originalIdx));
    } else if (curr.type === "speech" && next.type === "speech") {
      result.push(makeGap(2, curr.originalIdx));
    }
  }

  // Add meditation bell at the end if completed is true and bellEnabled is true
  if (completed && bellEnabled && steps.length > 0) {
    const lastIdx = steps[steps.length - 1].originalIdx;
    result.push(makeBell(lastIdx));
  }

  return result;
}
