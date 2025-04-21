import { Skeleton } from "@/components/ui/skeleton";
import { gradientBackgroundClasses } from "@/components/layout/Layout";
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
  RotateCcw,
} from "lucide-react";

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

  const stepsForPlayer = optimizeStepsForPlayer(steps);

  const { audioRef, playingStepIdx, jumpToStep } = usePlayer(stepsForPlayer);

  // Find the edge: the first step (type 'speech') that is not completed or missing audio
  const edgeIdx = getReadyEdgeIdx(steps);

  return (
    <>
      {/* Header (fixed) */}
      <div className="bg-card border-muted-foreground/10 border-b-3 z-10 shrink-0 px-4 pb-2 pt-3">
        <div className="text-center text-2xl tracking-tight md:text-3xl">
          {title ? title : <Skeleton className="mx-auto h-8 w-2/3 md:h-10" />}
        </div>
      </div>
      {/* Main scrollable content */}
      <div
        className={cn(
          "flex-1 overflow-auto px-4 py-2 scrollbar-thin md:px-14 md:py-4",
          gradientBackgroundClasses
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
                onClick={
                  isPlayable && step.audio ? () => jumpToStep(idx) : undefined
                }
                key={idx}
                className={cn(
                  "text-lg py-1 md:py-1.5 my-1 px-2 md:px-3 rounded transition-all",
                  isPlayable && "cursor-pointer hover:bg-primary/10 group",
                  isFaded && "pointer-events-none animate-soft-pulse",
                  !wasPlayed && !isFaded && "text-accent-foreground opacity-60",
                  !wasPlayed && !isFaded && isPlayable && "hover:opacity-100",
                  isActive && "outline-1 animate-bg-pulse"
                )}
              >
                {step.type === "heading" && (
                  <div
                    className={cn(
                      "text-xl mt-4 md:mt-6 md:text-2xl text-muted-foreground tracking-tight"
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
      <div className="bg-card border-muted-foreground/10 border-t-3 z-10 hidden shrink-0 px-4 py-3">
        {/* Playback controls UI */}
        <div className="space-y-0">
          {/* Control buttons UI  */}
          <div className="mb-4 flex items-center justify-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Restart">
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
                  aria-label="Backward 15 seconds"
                >
                  <ChevronLeft size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip backward 15 seconds</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="lg"
                  className="h-12 w-12 rounded-full"
                  aria-label="Play"
                >
                  <Play size={20} className="ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Play</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Forward 15 seconds"
                >
                  <ChevronRight size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip forward 15 seconds</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Mute ending bell"
                >
                  <Bell size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mute ending bell</TooltipContent>
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
