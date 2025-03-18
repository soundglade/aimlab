import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Meditation } from "./types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipBack, SkipForward, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import * as meditationTimeline from "./utils/meditation-timeline";
import dynamic from "next/dynamic";

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
  onAudioLoaded?: () => void;
}

export function MeditationPlayer({
  meditation,
  meditationId,
  audioUrl,
  className,
  onAudioLoaded,
}: MeditationPlayerProps) {
  // Player state
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentStepIndex: 0,
    progress: 0,
    currentTimeMs: 0,
    totalDurationMs: meditation.timeline?.totalDurationMs || 0,
    isLoading: true,
    audioReady: false,
  });

  // References for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add ref for the current active step
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Load and setup audio
  useEffect(() => {
    const audio = new Audio(audioUrl);

    const handleCanPlay = () => {
      setPlayerState((prev) => ({
        ...prev,
        isLoading: false,
        audioReady: true,
        totalDurationMs: audio.duration * 1000,
      }));
      onAudioLoaded?.();
    };

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
      if (audioRef.current && playerState.audioReady && meditation.timeline) {
        const currentTimeSec = audioRef.current.currentTime;
        const currentTimeMs = currentTimeSec * 1000;
        const totalDurationSec = audioRef.current.duration;
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
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleAudioEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    audioRef.current = audio;
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleAudioEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current = null;
    };
  }, [
    audioUrl,
    onAudioLoaded,
    meditation.timeline,
    playerState.audioReady,
    meditation.steps,
  ]);

  // Add effect to handle scrolling when current step changes
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [playerState.currentStepIndex]);

  const startPlayback = () => {
    if (!playerState.audioReady) return;
    setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    audioRef.current?.play().catch(() => {
      pausePlayback();
    });
  };

  const pausePlayback = () => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    audioRef.current?.pause();
  };

  const seekRelative = (secondsToAdd: number) => {
    if (audioRef.current && playerState.audioReady) {
      const currentTime = audioRef.current.currentTime;
      const newTime = Math.max(
        0,
        Math.min(currentTime + secondsToAdd, audioRef.current.duration)
      );
      audioRef.current.currentTime = newTime;
    }
  };

  const seekToStep = (stepIndex: number) => {
    if (
      !playerState.audioReady ||
      !audioRef.current ||
      !meditation.timeline ||
      stepIndex < 0 ||
      stepIndex >= meditation.steps.length
    ) {
      return;
    }

    const startTimeMs = meditationTimeline.getTimeForStep(
      meditation.timeline.timings,
      stepIndex
    );
    audioRef.current.currentTime = startTimeMs / 1000;
    setPlayerState((prev) => ({ ...prev, currentStepIndex: stepIndex }));

    if (!playerState.isPlaying) {
      startPlayback();
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPercentage = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = clickPercentage * audioRef.current.duration;
  };

  return (
    <>
      <h1 className="text-xl sm:text-2xl font-medium text-center mb-5">
        {meditation.title}
      </h1>

      {/* Use the dynamically loaded action buttons component */}
      <MeditationActionButtons
        meditationId={meditationId}
        audioUrl={audioUrl}
        meditationTitle={meditation.title}
      />

      <Card className={cn("p-4 sm:p-6", className)}>
        {/* Loading state */}
        {playerState.isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader className="animate-spin mb-4" size={32} />
            <p className="text-muted-foreground">Loading meditation audio...</p>
          </div>
        )}

        {/* Meditation script display */}
        {!playerState.isLoading && (
          <>
            <div className="max-h-[55vh] rounded-md bg-background/50 text-foreground/60 overflow-y-auto">
              <div className="space-y-2">
                {meditation.steps.map((step, idx) => {
                  return (
                    <div
                      key={idx}
                      ref={
                        playerState.currentStepIndex === idx
                          ? activeStepRef
                          : null
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
                        step.type === "speech"
                          ? () => seekToStep(idx)
                          : undefined
                      }
                    >
                      {step.type === "heading" && (
                        <div className={cn("font-medium text-lg")}>
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
                  <div className="absolute inset-0 opacity-0 hover:opacity-10 bg-primary transition-opacity"></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {formatTime(playerState.currentTimeMs)} /{" "}
                    {formatTime(playerState.totalDurationMs)}
                  </span>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => seekRelative(-15)}
                  disabled={!playerState.audioReady}
                  aria-label="Backward 15 seconds"
                >
                  <SkipBack size={20} />
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={
                    playerState.isPlaying ? pausePlayback : startPlayback
                  }
                  disabled={!playerState.audioReady}
                  aria-label={playerState.isPlaying ? "Pause" : "Play"}
                >
                  {playerState.isPlaying ? (
                    <Pause size={20} />
                  ) : (
                    <Play size={20} className="ml-1" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => seekRelative(15)}
                  disabled={!playerState.audioReady}
                  aria-label="Forward 15 seconds"
                >
                  <SkipForward size={20} />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
