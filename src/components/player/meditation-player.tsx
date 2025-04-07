import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Meditation } from "@/components/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Loader,
  Bell,
  RotateCcw,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as meditationTimeline from "@/components/utils/meditation-timeline";
import dynamic from "next/dynamic";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import the action buttons component dynamically
const MeditationActionButtons = dynamic(
  () =>
    import("./meditation-action-buttons").then(
      (mod) => mod.MeditationActionButtons
    ),
  { ssr: false }
);

interface MeditationPlayerProps {
  meditation: Meditation;
  meditationId: string;
  audioUrl: string;
  className?: string;
  embedded?: boolean;
}

export function MeditationPlayer({
  meditation,
  meditationId,
  audioUrl,
  className,
  embedded,
}: MeditationPlayerProps) {
  // Player state
  const [isLoading, setIsLoading] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const [totalDurationMs, setTotalDurationMs] = useState(0);

  // References for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load and setup audio
  useEffect(() => {
    const audio = new Audio(audioUrl);

    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioReady(true);
      setTotalDurationMs(audio.duration * 1000);
    };

    audio.addEventListener("canplay", handleCanPlay);

    audioRef.current = audio;
    audio.load();

    return () => {
      audio.pause();
      // Remove all event listeners by recreating the audio element
      const newAudio = new Audio();
      audio.src = "";
      audioRef.current = null;
    };
  }, [audioUrl]);

  return (
    <>
      <h1 className="text-center text-2xl tracking-tight">
        {meditation.title}
      </h1>

      <div className="mb-3 mt-1 flex justify-center md:mb-8">
        <MeditationActionButtons
          meditationId={meditationId}
          audioUrl={audioUrl}
          meditationTitle={meditation.title}
          embedded={embedded}
        />
      </div>

      <Card className={cn("p-4 sm:p-6", className)}>
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader className="mb-4 animate-spin" size={32} />
            <p className="text-muted-foreground">Loading meditation audio...</p>
          </div>
        )}

        {/* Meditation script display */}
        {!isLoading && audioRef.current && audioReady && (
          <LoadedPlayer
            meditation={meditation}
            audio={audioRef.current}
            totalDurationMs={totalDurationMs}
          />
        )}
      </Card>
    </>
  );
}

function LoadedPlayer({ meditation, audio, totalDurationMs }) {
  // Add ref for the current active step
  const activeStepRef = useRef<HTMLDivElement>(null);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPercentage = (e.clientX - rect.left) / rect.width;
    audio.currentTime = clickPercentage * audio.duration;
  };

  // Player state
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentStepIndex: 0,
    progress: 0,
    currentTimeMs: 0,
  });

  const handleAudioEnded = () => {
    pausePlayback();
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: false,
      currentStepIndex: 0,
      progress: 0,
      currentTimeMs: 0,
    }));
  };

  const handleTimeUpdate = () => {
    const currentTimeSec = audio.currentTime;
    const currentTimeMs = currentTimeSec * 1000;
    const totalDurationSec = audio.duration;
    const totalDurationMs = totalDurationSec * 1000;
    const progress = (currentTimeSec / totalDurationSec) * 100;

    const currentStepIndex = meditationTimeline.getStepIndexAtTime(
      meditation.timeline.timings,
      currentTimeMs
    );

    setPlayerState((prev) => ({
      ...prev,
      currentTimeMs,
      totalDurationMs,
      progress: Math.min(progress, 100),
      currentStepIndex:
        currentStepIndex >= 0 ? currentStepIndex : prev.currentStepIndex,
    }));
  };

  audio.addEventListener("timeupdate", handleTimeUpdate);
  audio.addEventListener("ended", handleAudioEnded);

  const reset = () => {
    audio.currentTime = 0;
  };

  const seekRelative = (secondsToAdd: number) => {
    const currentTime = audio.currentTime;
    const newTime = Math.max(
      0,
      Math.min(currentTime + secondsToAdd, audio.duration)
    );
    audio.currentTime = newTime;
  };

  const pausePlayback = () => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    audio.pause();
  };

  const startPlayback = () => {
    setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    audio.play().catch(() => {
      pausePlayback();
    });
  };

  const seekToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= meditation.steps.length) {
      return;
    }

    const startTimeMs = meditationTimeline.getTimeForStep(
      meditation.timeline.timings,
      stepIndex
    );
    audio.currentTime = startTimeMs / 1000;
    setPlayerState((prev) => ({ ...prev, currentStepIndex: stepIndex }));

    if (!playerState.isPlaying) {
      startPlayback();
    }
  };

  // Add effect to handle scrolling when current step changes
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [playerState.currentStepIndex]);

  return (
    <>
      <div className="scrollbar-thin bg-background/50 text-muted-foreground/80 max-h-[50vh] overflow-y-auto rounded-md">
        <div className="space-y-2">
          {meditation.steps.map((step, idx) => {
            return (
              <div
                key={idx}
                ref={
                  playerState.currentStepIndex === idx ? activeStepRef : null
                }
                className={cn(
                  "p-3 rounded transition-colors",
                  step.type === "speech" &&
                    "border-l-4 border-transparent cursor-pointer hover:bg-primary/10 group",
                  playerState.currentStepIndex === idx &&
                    "border-l-4 bg-primary/10 border-primary",
                  playerState.currentStepIndex >= idx && "text-foreground"
                )}
                onClick={
                  step.type === "speech" ? () => seekToStep(idx) : undefined
                }
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
          })}
        </div>
      </div>

      {/* Playback controls */}
      <div className="space-y-0">
        {/* Progress bar */}
        <div className="space-y-1">
          <div
            className="relative cursor-pointer"
            onClick={handleProgressBarClick}
            title="Click to seek"
          >
            <Progress value={playerState.progress} className="h-2" />
            <div className="bg-primary absolute inset-0 opacity-0 transition-opacity hover:opacity-10"></div>
          </div>
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>
              {formatTime(playerState.currentTimeMs)} /{" "}
              {formatTime(totalDurationMs)}
            </span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={reset}
                aria-label="Restart"
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
                onClick={() => seekRelative(-15)}
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
                onClick={playerState.isPlaying ? pausePlayback : startPlayback}
                aria-label={playerState.isPlaying ? "Pause" : "Play"}
              >
                {playerState.isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} className="ml-1" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {playerState.isPlaying ? "Pause" : "Play"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => seekRelative(15)}
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
                onClick={() => seekRelative(-15)}
                aria-label="Mute ending bell"
              >
                <BellOff size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mute ending bell</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </>
  );
}

const formatTime = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
