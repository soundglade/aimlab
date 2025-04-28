import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Reading, ReadingStep } from "@/components/types";
import { usePlayer, optimizeStepsForPlayer } from "./player-logic";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellOff,
  RotateCcw,
  LoaderCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ReadingDrawerContentProps {
  script: Reading;
}

// Skeleton for steps
function StepsSkeleton() {
  return (
    <div>
      {[...Array(10)].map((_, idx) => (
        <div key={idx} className="mb-2 rounded p-3">
          <Skeleton className="mb-1 h-3 w-3/4 md:h-4" />
          <Skeleton className="h-3 w-full md:h-4" />
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
  const completed = script?.completed;

  const [bellEnabled, setBellEnabled] = useState(true);

  const stepsForPlayer = optimizeStepsForPlayer(steps, completed, bellEnabled);

  const { audioRef, playingStepIdx, jumpToStep, play, pause, status } =
    usePlayer(stepsForPlayer);

  // Ref for the active step
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center the active step when it changes
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [playingStepIdx]);

  // Find the edge: the first step (type 'speech') that is not completed or missing audio
  const edgeIdx = getReadyEdgeIdx(steps);

  // Calculate next and previous playable step indices (not type 'heading')
  const previousPlayableStepIdx = (() => {
    if (playingStepIdx == null || playingStepIdx <= 0) return null;
    for (let i = playingStepIdx - 1; i >= 0; i--) {
      if (steps[i]?.type !== "heading") return i;
    }
    return null;
  })();

  const nextPlayableStepIdx = (() => {
    if (playingStepIdx == null) return null;
    for (let i = playingStepIdx + 1; i < edgeIdx; i++) {
      if (steps[i]?.type !== "heading") return i;
    }
    return null;
  })();

  return (
    <>
      {/* Header (fixed) */}
      <div className="border-muted-foreground/10 z-10 shrink-0 border-b-2 px-4 pb-2 pt-3">
        <div className="text-center text-2xl tracking-tight md:mb-2 md:text-3xl">
          {title ? title : <Skeleton className="mx-auto h-8 w-2/3 md:h-10" />}
        </div>
      </div>
      {/* Main scrollable content */}
      <div
        className={cn(
          "flex-1 bg-background overflow-auto px-4 py-2 scrollbar-thin md:px-12 md:py-8"
        )}
      >
        {steps.length > 0 ? (
          steps.map((step, idx) => {
            // Steps after the edge should be faded
            const isFaded = idx > edgeIdx - 1;
            const wasPlayed = idx <= (playingStepIdx ?? -1);
            const isActive = idx === (playingStepIdx ?? -1);
            const isPlayable = step.type === "speech" || step.type === "pause";
            return (
              <div
                ref={isActive ? activeStepRef : undefined}
                onClick={
                  isPlayable && step.audio ? () => jumpToStep(idx) : undefined
                }
                key={idx}
                className={cn(
                  "md:text-lg py-1 my-1 px-2 md:px-3 rounded transition-all",
                  isPlayable && "cursor-pointer hover:bg-primary/10 group",
                  isFaded && "pointer-events-none animate-soft-pulse",
                  !wasPlayed && !isFaded && "text-accent-foreground opacity-80",
                  !wasPlayed && !isFaded && isPlayable && "hover:opacity-100",
                  isActive && "outline-1 animate-bg-pulse"
                )}
              >
                {step.type === "heading" && (
                  <div
                    className={cn(
                      "text-xl mt-4 md:mt-6 md:text-2xl tracking-tight"
                    )}
                  >
                    {step.text}
                  </div>
                )}
                {step.type === "speech" && <p>{step.text}</p>}
                {step.type === "pause" && (
                  <p className="text-muted-foreground/70 italic">
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
      <div className="border-muted-foreground/10 z-10 shrink-0 border-t-2 px-4 py-3">
        {/* Playback controls UI */}
        <div className="space-y-0">
          {/* Control buttons UI  */}
          <div className="mb-4 mt-2 flex items-center justify-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Restart"
                  onClick={() => jumpToStep(0)}
                  disabled={!stepsForPlayer[0]?.audio}
                  className="md:size-6 md:h-11 md:w-11"
                >
                  <RotateCcw size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Restart</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Backward"
                  onClick={() =>
                    previousPlayableStepIdx != null &&
                    jumpToStep(previousPlayableStepIdx)
                  }
                  disabled={previousPlayableStepIdx == null}
                  className="md:size-6 md:h-11 md:w-11"
                >
                  <ChevronLeft size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip backward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="lg"
                  className="h-12 w-12 rounded-full md:h-14 md:w-14"
                  aria-label={status === "playing" ? "Pause" : "Play"}
                  onClick={status === "playing" ? pause : play}
                  disabled={status === "waiting" || stepsForPlayer.length === 0}
                >
                  {status === "playing" ? (
                    <Pause size={20} className="md:size-6" />
                  ) : status === "waiting" ? (
                    <LoaderCircle className="md:size-7 size-6 animate-spin" />
                  ) : (
                    <Play size={20} className="md:size-6 ml-0.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {status === "playing" ? "Pause" : "Play"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Forward"
                  onClick={() =>
                    nextPlayableStepIdx != null &&
                    jumpToStep(nextPlayableStepIdx)
                  }
                  disabled={nextPlayableStepIdx == null}
                  className="md:size-6 md:h-11 md:w-11"
                >
                  <ChevronRight size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip forward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={
                    bellEnabled ? "Mute ending bell" : "Enable ending bell"
                  }
                  onClick={() => setBellEnabled((b) => !b)}
                  className="md:size-6 md:h-11 md:w-11"
                >
                  {bellEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {bellEnabled ? "Mute ending bell" : "Enable ending bell"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
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
