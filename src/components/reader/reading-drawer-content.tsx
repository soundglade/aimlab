import { Skeleton } from "@/components/ui/skeleton";
import { gradientBackgroundClasses } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { Reading, ReadingStep } from "@/components/types";
import { useEffect, useRef } from "react";

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

  const stepsForPlayer = script?.steps
    ?.map((s, idx) => ({ ...s, idx }))
    ?.filter((s) => s.completed);

  const { audioRef } = usePlayer(stepsForPlayer);

  // Find the edge: the first step (type 'speech') that is not completed or missing audio
  const edgeIdx = getReadyEdgeIdx(script?.steps || []);

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
        {script.steps && script.steps.length > 0 ? (
          script.steps.map((step, idx) => {
            // Steps after the edge should be faded
            const isFaded = idx > edgeIdx - 1;
            return (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded transition-colors",
                  step.type === "speech" &&
                    "border-l-4 border-transparent cursor-pointer hover:bg-primary/10 group",
                  isFaded && "opacity-40 pointer-events-none animate-pulse"
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
  // Audio playback state
  const currentStepIdxRef = useRef<number>(0);
  const playingStepIdxRef = useRef<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const latestStepsRef = useRef(steps);

  // Keep latest script ref up to date
  useEffect(() => {
    latestStepsRef.current = steps;
  }, [steps]);

  function isCurrentStepNotPlayable() {
    const currentStep = latestStepsRef.current?.[currentStepIdxRef.current];
    return currentStep?.type == "heading";
  }

  // Play audio for the current step if available
  useEffect(() => {
    const handleEnded = () => {
      moveToNextStep();
    };

    const moveToNextStep = () => {
      const nextIdx = currentStepIdxRef.current + 1;
      currentStepIdxRef.current = nextIdx;
      playStepAudio(nextIdx);
    };

    const playStepAudio = (stepIdx: number) => {
      const step = latestStepsRef.current?.[stepIdx];
      const alreadyPlayed = playingStepIdxRef.current >= stepIdx;

      if (audioRef.current && step?.audio && !alreadyPlayed) {
        playingStepIdxRef.current = stepIdx;
        audioRef.current.src = step.audio;
        audioRef.current.addEventListener("ended", handleEnded);
        audioRef.current?.play();
      }
    };

    if (isCurrentStepNotPlayable()) {
      moveToNextStep();
    } else {
      playStepAudio(currentStepIdxRef.current);
    }
  }, [steps]);

  return { audioRef };
};
