import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Reading, ReadingStep } from "@/components/types";
import { usePlayer } from "./player-logic";
import { optimizeStepsForPlayer } from "@/lib/reading-timings";
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
  LoaderCircle,
  RotateCcw,
  Maximize,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUserInactivity } from "./user-inactivity";
import { FocusMode } from "./focus-mode";
import { toast } from "sonner";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { ConfirmDestructiveDialog } from "@/components/ui/confirm-destructive-dialog";

interface ReadingDrawerContentProps {
  script: any;
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
  const readingId = script?.readingId;
  const savedByScript = script?.saved;
  const title = script?.title;
  const steps = script?.steps || [];
  const completed = script?.completed;
  const fullAudio = script?.fullAudio;

  const [bellEnabled, setBellEnabled] = useState(true);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [wasSavedHere, setWasSavedHere] = useState(false);
  const isSaved = savedByScript || wasSavedHere;
  const isPublic = script?.public;
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    addMeditation,
    deleteMeditation,
    hideMeditation,
    saveInstantMeditation,
    shareInstantMeditation,
  } = useMyMeditations();

  const stepsForPlayer = optimizeStepsForPlayer(steps, completed, bellEnabled);

  const { audioRef, playingStepIdx, jumpToStep, play, pause, status } =
    usePlayer(stepsForPlayer);

  // Ref for the active step
  const activeStepRef = useRef<HTMLDivElement>(null);

  const isInactive = useUserInactivity(10000);
  const isLongInactive = useUserInactivity(30000);

  // Auto-scroll to center the active step when it changes, only if user is inactive
  useEffect(() => {
    if (isInactive && activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [playingStepIdx /* isInactive ignored on purpose */]);

  // Auto-activate focus mode when playing and inactive
  useEffect(() => {
    if (status === "playing" && isLongInactive) {
      setFocusModeActive(true);
    }
  }, [status, isLongInactive]);

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

  // Manual trigger handler
  const handleManualFocusMode = () => setFocusModeActive(true);

  // Button click handlers (no functionality implemented yet)
  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = fullAudio || "";
    link.download = `${title || "meditation"}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveInstantMeditation(readingId!, false);
      toast.success("Meditation saved privately", {
        position: "bottom-center",
        duration: 3000,
      });
      setWasSavedHere(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save meditation"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (!fullAudio) {
      toast.message(
        "The meditation is not ready to share yet. Please try again in a moment.",
        {
          position: "bottom-center",
        }
      );
      return;
    }
    setShowShareDialog(true);
  };

  const handleHide = async () => {
    try {
      await hideMeditation(readingId!);
      // Redirect to the instant page
      window.location.href = "/instant";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to hide meditation"
      );
    }
  };

  const handleConfirmShare = async () => {
    try {
      if (!isSaved) {
        // Meditation not saved yet - save with public flag
        const result = await saveInstantMeditation(readingId!, true);
        window.location.href = result.url;
        setWasSavedHere(true);
      } else {
        // Meditation already saved - share it
        const result = await shareInstantMeditation(readingId!);
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to share meditation"
      );
    } finally {
      setShowShareDialog(false);
    }
  };

  return (
    <>
      {/* Header (fixed) */}
      <div className="border-muted-foreground/10 z-10 flex shrink-0 items-center justify-between border-b-2 px-4 pb-2 pt-3">
        <div className="flex-1 text-center text-2xl tracking-tight md:mb-2 md:text-3xl">
          {title ? title : <Skeleton className="mx-auto h-8 w-2/3 md:h-10" />}
        </div>

        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Focus"
              onClick={handleManualFocusMode}
              className="size-7 sm:size-9 absolute right-2 top-2 sm:right-3 sm:top-3"
            >
              <Maximize className="size-3 md:size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Focus</TooltipContent>
        </Tooltip>
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
      <div className="border-muted-foreground/10 z-10 shrink-0 border-t-2 px-4 pb-3 pt-2">
        {/* Playback controls UI */}
        <div className="space-y-0">
          {/* Control buttons UI  */}
          <div className="mb-4 mt-2 flex items-center justify-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => jumpToStep(0)}
                  disabled={previousPlayableStepIdx == null}
                  aria-label="Restart"
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
          {/* Save, share, download buttons UI  */}
          <div className="mb-4 mt-2 flex items-center justify-center">
            <div className="border-input flex rounded-full border opacity-60">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-block"
                    onClick={() => {
                      if (fullAudio) {
                        handleDownload();
                      } else {
                        toast.message(
                          "The meditation is not ready for download yet. Please try again in a moment.",
                          {
                            position: "bottom-center",
                          }
                        );
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      disabled={!fullAudio}
                      className="hover:bg-accent hover:text-accent-foreground text-muted-foreground h-auto w-[80px] rounded-none rounded-l-full border-0 p-1 px-4 sm:p-1.5"
                    >
                      mp3
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {fullAudio ? "Download MP3" : "Download not ready yet..."}
                </TooltipContent>
              </Tooltip>
              <div className="bg-border w-px" />
              {!isSaved ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-block"
                      onClick={() => {
                        if (fullAudio && !isSaving) {
                          handleSave();
                        } else if (!fullAudio) {
                          toast.message(
                            "The meditation is not ready to save yet. Please try again in a moment.",
                            {
                              position: "bottom-center",
                            }
                          );
                        }
                      }}
                    >
                      <Button
                        variant="ghost"
                        disabled={!fullAudio || isSaving}
                        className="hover:bg-accent hover:text-accent-foreground text-muted-foreground h-auto w-[80px] rounded-none border-0 p-1 px-4 sm:p-1.5"
                      >
                        {isSaving ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          "save"
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSaving
                      ? "Saving..."
                      : fullAudio
                      ? "Save meditation privately"
                      : "Save not ready yet..."}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-block"
                      onClick={async () => {
                        await deleteMeditation(readingId!);
                        window.location.href = "/instant";
                      }}
                    >
                      <Button
                        variant="ghost"
                        className="hover:bg-accent hover:text-accent-foreground text-muted-foreground h-auto w-[80px] rounded-none border-0 p-1 px-4 sm:p-1.5"
                      >
                        delete
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Delete saved meditation</TooltipContent>
                </Tooltip>
              )}
              <div className="bg-border w-px" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-block"
                    onClick={isPublic ? handleHide : handleShare}
                  >
                    <Button
                      variant="ghost"
                      disabled={!fullAudio}
                      className="hover:bg-accent hover:text-accent-foreground text-muted-foreground h-auto w-[80px] rounded-none rounded-r-full border-0 p-1 px-4 tracking-wider sm:p-1.5"
                    >
                      {isPublic ? "hide" : "share"}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {!fullAudio
                    ? isPublic
                      ? "Hide not ready yet..."
                      : "Share not ready yet..."
                    : isPublic
                    ? "Make meditation private"
                    : "Share meditation publicly"}
                </TooltipContent>
              </Tooltip>
            </div>
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
      {/* Focus Mode Overlay */}
      {focusModeActive && (
        <FocusMode
          onExit={() => setFocusModeActive(false)}
          activeStep={steps[playingStepIdx ?? -1]}
          steps={steps}
          stepsForPlayer={stepsForPlayer}
        />
      )}

      {/* Share Confirmation Dialog */}
      <ConfirmDestructiveDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        title="Share meditation"
        description="Shared meditations are visible to everyone. Are you sure you want to share it publicly?"
        confirmText="Share Publicly"
        onConfirm={handleConfirmShare}
      >
        <div />
      </ConfirmDestructiveDialog>
    </>
  );
}
