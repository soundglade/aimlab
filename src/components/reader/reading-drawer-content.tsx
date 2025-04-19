import { Skeleton } from "@/components/ui/skeleton";
import { gradientBackgroundClasses } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { Reading, ReadingStep } from "@/components/types";
import { useEffect, useRef, useReducer } from "react";

interface ReadingDrawerContentProps {
  script: Reading;
}

// Skeleton for steps
function StepsSkeleton() {
  return (
    <div>
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="mb-2 rounded p-3">
          <Skeleton className="mb-1 h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// Pure function to find the edge index
function getReadyEdgeIdx(steps: ReadingStep[]): number {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const nextStep = steps[i + 1];
    if (step.type === "heading" && (!nextStep?.completed || !nextStep?.audio)) {
      return i;
    }
    if (step.type === "speech" && (!step.completed || !step.audio)) {
      return i;
    }
  }
  return steps.length;
}

export function ReadingDrawerContent({ script }: ReadingDrawerContentProps) {
  const title = script?.title;
  const steps = script?.steps || [];

  const stepsForPlayer = steps
    ?.map((s, idx) => ({ ...s, idx }))
    ?.filter((s) => s.type !== "heading")
    ?.filter((s) => s.completed);

  const { audioRef, playingStepIdx, jumpToStep } = usePlayer(stepsForPlayer);

  // Find the edge: the first step (type 'speech') that is not completed or missing audio
  const edgeIdx = getReadyEdgeIdx(steps);

  return (
    <>
      {/* Header (fixed) */}
      <div className="bg-card border-muted-foreground/10 border-b-3 z-10 shrink-0 px-4 pb-2 pt-3">
        <div className="text-center text-2xl tracking-tight">
          {title ? title : <Skeleton className="mx-auto h-8 w-2/3" />}
        </div>
      </div>
      {/* Main scrollable content */}
      <div
        className={cn(
          "flex-1 overflow-auto px-4 py-2",
          gradientBackgroundClasses
        )}
      >
        {steps.length > 0 ? (
          steps.map((step, idx) => {
            // Steps after the edge should be faded
            const isFaded = idx > edgeIdx - 1;
            const wasPlayed = idx <= (playingStepIdx ?? -1);
            const isActive = idx === (playingStepIdx ?? -1);
            return (
              <div
                onClick={
                  step.type === "speech" && step.audio
                    ? () => jumpToStep(idx)
                    : undefined
                }
                key={idx}
                className={cn(
                  "py-2 px-2 rounded transition-colors",
                  step.type === "speech" &&
                    "border-l-4 border-transparent cursor-pointer hover:bg-primary/5 group",
                  isFaded && "pointer-events-none animate-soft-pulse",
                  !wasPlayed && !isFaded && "opacity-70",
                  isActive &&
                    "border-primary animate-border-pulse bg-primary/20 hover:bg-primary/20"
                )}
              >
                {step.type === "heading" && (
                  <div
                    className={cn(
                      "text-xl text-muted-foreground tracking-tight"
                    )}
                  >
                    {step.text}
                  </div>
                )}
                {step.type === "speech" && <p>{step.text}</p>}
                {step.type === "pause" && (
                  <p className="text-muted-foreground italic">
                    {step.duration}s pause
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <StepsSkeleton />
        )}
      </div>
      {/* Footer (fixed) */}
      <div className="bg-card z-10 shrink-0 px-4 py-3 border-muted-foreground/10 border-t-3">
        <button className="bg-primary text-primary-foreground w-full rounded py-2 font-medium">
          Dummy Button
        </button>
      </div>
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        style={{ display: "none" }}
        controls={false}
        preload="auto"
      />
    </>
  );
}

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
type Action =
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
 * Keeps the external API of the previous `usePlayer` (plus pause/play helpers).
 */
export const usePlayer = (steps: ReadingStep[]) => {
  const [state, dispatch] = useReducer(reducer, {
    status: "idle",
    playingIdx: -1,
    pendingIdx: null,
  } as State);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const latestStepsRef = useRef<ReadingStep[]>(steps);

  // Keep latest steps array in a stable ref
  useEffect(() => {
    latestStepsRef.current = steps;
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

  // Auto‑start first available step once
  useEffect(() => {
    if (state.playingIdx === -1 && steps.length > 0) {
      attemptPlay(0);
    }
    // Intentionally ignore `state` deps – we only want this once per steps load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

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
      (s: any) => s.idx === originalIdx
    );
    if (playerIdx === -1) return;
    audioRef.current?.pause();
    attemptPlay(playerIdx, true);
  };

  const externalStepIdx = steps[state.playingIdx]?.idx;

  return {
    audioRef,
    playingStepIdx: externalStepIdx,
    jumpToStep,
    pause,
    play,
  } as const;
};
