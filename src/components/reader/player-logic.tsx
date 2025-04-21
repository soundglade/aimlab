import { useEffect, useRef, useReducer } from "react";
import type { PlayerStep } from "@/components/types";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

type Status = "idle" | "playing" | "paused" | "waiting";

interface State {
  /** Index in the *filtered* `steps` array. `-1` before first play. */
  playingIdx: number;
  /** Index we want to play but whose audio is not yet present. */
  pendingIdx: number | null;
  status: Status;
}

/**
 * All events that can change the player state.  Reducer is tiny on purpose –
 * side‑effects (DOM, timers) live outside and call `attemptPlay()`.
 */
export type Action =
  | { type: "PLAY"; idx: number }
  | { type: "WAIT"; idx: number } // wait for audio of idx
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "PLAY":
      return { status: "playing", playingIdx: action.idx, pendingIdx: null };
    case "WAIT":
      return { ...state, status: "waiting", pendingIdx: action.idx };
    case "PAUSE":
      return { ...state, status: "paused" };
    case "RESUME":
      return { ...state, status: "playing" };
    case "RESET":
      return { status: "idle", playingIdx: -1, pendingIdx: null };
    default:
      return state;
  }
};

// ──────────────────────────────────────────────────────────────
// Public hook
// ──────────────────────────────────────────────────────────────

/**
 * Minimal player hook with *vanilla* `useReducer` FSM.
 * Accepts PlayerStep[] instead of ReadingStep[].
 */
export const usePlayer = (steps: PlayerStep[]) => {
  const [state, dispatch] = useReducer(reducer, {
    status: "waiting",
    playingIdx: -1,
    pendingIdx: 0,
  } as State);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const latestStepsRef = useRef<PlayerStep[]>(steps);

  // Track already-fetched audio URLs across renders
  const prefetchedAudio = useRef<Set<string>>(new Set());

  // Keep latest steps array in a stable ref
  useEffect(() => {
    latestStepsRef.current = steps;
  }, [steps]);

  // Pre-fetch audio assets to warm HTTP cache
  useEffect(() => {
    steps.forEach((step) => {
      if (step.audio && !prefetchedAudio.current.has(step.audio)) {
        prefetchedAudio.current.add(step.audio);
        fetch(step.audio, { cache: "default" }).catch(() => {
          // swallow errors – will fallback to normal load later
        });
      }
    });
  }, [steps]);

  // ────────────────────────────────────────────────────────────
  // Imperative side‑effect helpers
  // ────────────────────────────────────────────────────────────

  /** Try to start playing `idx`. Falls back to WAIT if audio src missing. */
  const attemptPlay = (idx: number, force = false) => {
    const el = audioRef.current;
    if (!el) return;

    const step = latestStepsRef.current[idx];
    if (!step) return;

    // Missing audio → go to waiting state and bail out
    if (!step.audio) {
      dispatch({ type: "WAIT", idx });
      return;
    }

    // Guard against rewinding unless forced (e.g. jump)
    if (!force && state.playingIdx >= idx) return;

    el.src = step.audio;
    el.play();
    dispatch({ type: "PLAY", idx });
  };

  // When a track ends, advance to next ready (or WAIT if missing)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const handleEnded = () => {
      const next = state.playingIdx + 1;
      if (next >= latestStepsRef.current.length) {
        dispatch({ type: "RESET" });
        return;
      }
      attemptPlay(next);
    };

    el.addEventListener("ended", handleEnded);
    return () => el.removeEventListener("ended", handleEnded);
    // Re‑subscribe whenever the current idx changes so `next` is fresh
  }, [state.playingIdx]);

  // Try to resume when we were waiting and audio arrives in updated `steps`
  useEffect(() => {
    if (state.status === "waiting" && state.pendingIdx !== null) {
      const step = latestStepsRef.current[state.pendingIdx];
      if (step?.audio) {
        attemptPlay(state.pendingIdx, true);
      }
    }
  }, [steps, state.status, state.pendingIdx]);

  // ────────────────────────────────────────────────────────────
  // Public controls
  // ────────────────────────────────────────────────────────────

  const pause = () => {
    const el = audioRef.current;
    if (el && state.status === "playing") {
      el.pause();
      dispatch({ type: "PAUSE" });
    }
  };

  const play = () => {
    const el = audioRef.current;
    if (el && state.status === "paused") {
      el.play();
      dispatch({ type: "RESUME" });
    }
  };

  const jumpToStep = (originalIdx: number) => {
    const playerIdx = latestStepsRef.current.findIndex(
      (s: any) => s.originalIdx === originalIdx
    );
    if (playerIdx === -1) return;
    audioRef.current?.pause();
    attemptPlay(playerIdx, true);
  };

  const externalStepIdx = steps[state.playingIdx]?.originalIdx;

  return {
    audioRef,
    playingStepIdx: externalStepIdx,
    jumpToStep,
    pause,
    play,
  } as const;
};

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
  completed?: boolean
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

  // Add meditation bell at the end if completed is true
  if (completed && steps.length > 0) {
    const lastIdx = steps[steps.length - 1].originalIdx;
    result.push(makeBell(lastIdx));
  }

  return result;
}

export type { State };
export { reducer };
