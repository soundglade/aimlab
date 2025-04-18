import { Skeleton } from "@/components/ui/skeleton";
import { gradientBackgroundClasses } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { Reading, ReadingStep } from "@/components/types";
import { useEffect, useRef, useState, useCallback } from "react";

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
      <div className="bg-card z-10 shrink-0 px-4 py-3">
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
            const isActive = idx === playingStepIdx;
            return (
              <div
                onClick={
                  step.type === "speech" && step.audio
                    ? () => jumpToStep(idx)
                    : undefined
                }
                key={idx}
                className={cn(
                  "p-3 rounded transition-colors",
                  step.type === "speech" &&
                    "border-l-4 border-transparent cursor-pointer hover:bg-primary/10 group",
                  isFaded && "opacity-40 pointer-events-none animate-pulse",
                  isActive && "border-primary bg-primary/10"
                )}
              >
                {step.type === "heading" && (
                  <div className={cn("text-lg")}>{step.text}</div>
                )}
                {step.type === "speech" && <p>{step.text}</p>}
                {step.type === "pause" && (
                  <p className="italic opacity-80">{step.duration}s pause</p>
                )}
              </div>
            );
          })
        ) : (
          <StepsSkeleton />
        )}
      </div>
      {/* Footer (fixed) */}
      <div className="bg-card z-10 shrink-0 px-4 py-3">
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

const usePlayer = (steps: ReadingStep[]) => {
  // Audio playback state with ability to jump
  const [playingStepIdx, setPlayingStepIdx] = useState<number>(-1);
  const currentStepIdxRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const latestStepsRef = useRef<ReadingStep[]>(steps);

  // Keep latest script ref up to date
  useEffect(() => {
    latestStepsRef.current = steps;
  }, [steps]);

  // Handle audio ended to play next (stable reference)
  const playStepAudio = useCallback(
    (idx: number, force = false) => {
      const step = latestStepsRef.current[idx];
      if (!audioRef.current || !step?.audio) return;
      if (!force && playingStepIdx >= idx) return;
      audioRef.current.src = step.audio;
      audioRef.current.play();
      setPlayingStepIdx(idx);
      currentStepIdxRef.current = idx;
    },
    [playingStepIdx]
  );

  const handleEnded = useCallback(() => {
    const next = currentStepIdxRef.current + 1;
    currentStepIdxRef.current = next;
    playStepAudio(next);
  }, [playStepAudio]);

  // Attach the ended handler only once
  useEffect(() => {
    const aud = audioRef.current;
    if (!aud) return;
    aud.addEventListener("ended", handleEnded);
    return () => aud.removeEventListener("ended", handleEnded);
  }, [handleEnded]);

  // Public API to jump to a step by original index
  const jumpToStep = (originalIdx: number) => {
    // find the position in the filtered steps array
    const playerIdx = latestStepsRef.current.findIndex(
      (step) => (step as any).idx === originalIdx
    );
    if (playerIdx === -1) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }
    currentStepIdxRef.current = playerIdx;
    playStepAudio(playerIdx, true);
  };

  // Auto-start playback once (skip if we've already started)
  useEffect(() => {
    if (playingStepIdx !== -1) return;
    const idx = currentStepIdxRef.current;
    playStepAudio(idx);
  }, [steps, playingStepIdx]);

  const originalPlayingStepIdx = steps[playingStepIdx]?.idx;

  return { audioRef, playingStepIdx: originalPlayingStepIdx, jumpToStep };
};
