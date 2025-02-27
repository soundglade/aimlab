import { Meditation } from "./NadaPage";

/**
 * Interface for timing information
 */
export interface Timing {
  index: number; // Index in the original steps array (-1 for gaps)
  type: string; // Type of step (speech, pause, gap, etc.)
  startTimeMs: number; // Start time in milliseconds
  endTimeMs: number; // End time in milliseconds
  durationMs: number; // Duration in milliseconds
  audioFileId?: string; // Reference to audio file if applicable
  isGap?: boolean; // Whether this timing represents a gap between steps
}

/**
 * Calculate timing information for all steps in a meditation
 */
export function calculateTimings(
  meditation: Meditation,
  defaultGapMs: number = 3000
): Timing[] {
  const timings: Timing[] = [];
  let currentTimeMs = 0;

  // First, identify which steps have audio duration
  const audioStepIndices = meditation.steps
    .map((step, index) => ({
      index,
      hasAudio:
        (step.type === "speech" && (step.durationMs || step.text)) ||
        (step.type === "pause" && step.durationMs) ||
        (step.type === "sound" && step.durationMs),
    }))
    .filter((item) => item.hasAudio)
    .map((item) => item.index);

  for (let i = 0; i < meditation.steps.length; i++) {
    const step = meditation.steps[i];
    let stepDurationMs = 0;

    // Calculate duration based on step type
    if (step.type === "speech") {
      // Use stored duration if available, otherwise estimate
      stepDurationMs = step.durationMs || (step.text.length / 15) * 1000;
    } else if (step.type === "pause") {
      stepDurationMs = step.durationMs || 0;
    } else if (step.type === "sound" && step.durationMs) {
      stepDurationMs = step.durationMs;
    } else if (
      step.type === "heading" ||
      step.type === "direction" ||
      step.type === "aside"
    ) {
      // Non-audio steps have no duration in the timeline
      continue; // Skip adding to timeline
    }

    // Add step to timings
    timings.push({
      index: i,
      type: step.type,
      startTimeMs: currentTimeMs,
      endTimeMs: currentTimeMs + stepDurationMs,
      durationMs: stepDurationMs,
      audioFileId: step.audioFileId,
      isGap: false,
    });

    // Update current time
    currentTimeMs += stepDurationMs;

    // Add gap after this step if it's not the last audio step
    const currentAudioIndex = audioStepIndices.indexOf(i);
    const isLastAudioStep = currentAudioIndex === audioStepIndices.length - 1;

    if (!isLastAudioStep && stepDurationMs > 0) {
      // Add a gap as a separate timing
      timings.push({
        index: -1, // Gaps don't correspond to a step in the original array
        type: "gap",
        startTimeMs: currentTimeMs,
        endTimeMs: currentTimeMs + defaultGapMs,
        durationMs: defaultGapMs,
        isGap: true,
      });

      currentTimeMs += defaultGapMs;
    }
  }

  return timings;
}

/**
 * Calculate and add timeline to a meditation
 */
export function addTimelineToMeditation(
  meditation: Meditation,
  defaultGapMs: number = 3000
): Meditation {
  const timings = calculateTimings(meditation, defaultGapMs);
  const totalDurationMs =
    timings.length > 0 ? timings[timings.length - 1].endTimeMs : 0;

  return {
    ...meditation,
    timeline: {
      timings,
      totalDurationMs,
    },
  };
}

/**
 * Find the active timing at a given time
 */
export function getActiveTimingAtTime(
  timings: Timing[],
  timeMs: number
): Timing | null {
  // Handle edge cases
  if (timeMs < 0 || timings.length === 0) return null;
  const totalDuration =
    timings.length > 0 ? timings[timings.length - 1].endTimeMs : 0;
  if (timeMs >= totalDuration) return null;

  // Find the timing that contains this time
  return (
    timings.find(
      (timing) => timeMs >= timing.startTimeMs && timeMs < timing.endTimeMs
    ) || null
  );
}

/**
 * Get the original step index at a given time
 * Returns -1 if the time falls within a gap or outside any timing
 */
export function getStepIndexAtTime(timings: Timing[], timeMs: number): number {
  const activeTiming = getActiveTimingAtTime(timings, timeMs);
  return activeTiming && !activeTiming.isGap ? activeTiming.index : -1;
}

/**
 * Get the time offset for a specific step
 */
export function getTimeForStep(timings: Timing[], stepIndex: number): number {
  const stepTiming = timings.find((t) => t.index === stepIndex && !t.isGap);
  return stepTiming ? stepTiming.startTimeMs : 0;
}

/**
 * Check if a time falls within a gap
 */
export function isInGap(timings: Timing[], timeMs: number): boolean {
  const activeTiming = getActiveTimingAtTime(timings, timeMs);
  return activeTiming ? activeTiming.isGap === true : false;
}
