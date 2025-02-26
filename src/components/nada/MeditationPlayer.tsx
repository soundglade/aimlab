import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Meditation, MeditationStep } from "./NadaPage";
import { FileStorageApi } from "@/lib/file-storage";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as synthesisService from "./synthesisService";
import { exportMeditationAudio, downloadAudioFile } from "./audioExporter";

interface MeditationPlayerProps {
  meditation: Meditation;
  fileStorage: FileStorageApi;
  onBack: () => void;
}

// Types for the player state
interface PlayerState {
  isPlaying: boolean;
  currentStepIndex: number;
  progress: number; // 0-100
  currentTime: number; // in seconds
  totalDuration: number; // in seconds
  isDownloading: boolean; // Track download state
  isGeneratingAudio: boolean; // Track audio generation state
  fullAudioReady: boolean; // Track if the full audio is ready
}

// Interface for step timing information
interface StepTiming {
  startTime: number;
  endTime: number;
  type: string;
}

export function MeditationPlayer({
  meditation,
  fileStorage,
  onBack,
}: MeditationPlayerProps) {
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentStepIndex: 0,
    progress: 0,
    currentTime: 0,
    totalDuration: 0, // Will be calculated when steps are processed
    isDownloading: false,
    isGeneratingAudio: true, // Start with generation in progress
    fullAudioReady: false,
  });

  // References for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepDurationsRef = useRef<number[]>([]);
  const cumulativeTimesRef = useRef<number[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const currentStepIndexRef = useRef<number>(0);
  const fullAudioUrlRef = useRef<string | null>(null);
  const stepTimingsRef = useRef<StepTiming[]>([]);

  // Update ref when state changes
  useEffect(() => {
    currentStepIndexRef.current = playerState.currentStepIndex;
  }, [playerState.currentStepIndex]);

  // Simplify duration calculation by combining related effects
  useEffect(() => {
    const generateFullAudio = async () => {
      try {
        setPlayerState((prev) => ({ ...prev, isGeneratingAudio: true }));

        // Combined audio generation and duration calculation
        const [url, totalDuration] = await Promise.all([
          exportMeditationAudio(meditation, fileStorage, {
            onProgress: (progress) =>
              console.log(`Audio generation progress: ${progress}%`),
          }),
          // Pre-calculate total duration from steps as fallback
          (async () => {
            let total = 0;
            for (const step of meditation.steps) {
              total +=
                step.type === "speech"
                  ? step.text.length / 15
                  : step.type === "pause"
                  ? step.duration
                  : 0;
            }
            return total;
          })(),
        ]);

        fullAudioUrlRef.current = url;

        // Create a temporary audio element to get duration
        const tempAudio = new Audio(url);
        await new Promise((resolve) => {
          tempAudio.onloadedmetadata = () => {
            resolve(null);
          };
          tempAudio.onerror = () => {
            console.error("Error loading audio metadata");
            resolve(null);
          };
        });

        // Calculate step durations and timings
        const durations: number[] = [];
        const timings: StepTiming[] = [];
        const cumulativeTimes: number[] = [];
        let currentTime = 0;

        for (const step of meditation.steps) {
          let stepDuration = 0;
          const startTime = currentTime;

          if (step.type === "speech") {
            // For speech steps, estimate duration based on text length
            // This is a rough estimate and will be refined later if possible
            stepDuration = step.text.length / 15;
          } else if (step.type === "pause") {
            stepDuration = step.duration;
          } else if (
            step.type === "heading" ||
            step.type === "direction" ||
            step.type === "aside"
          ) {
            // Non-audio steps have minimal duration
            stepDuration = 0.1; // Very small duration for non-audio steps
          }

          currentTime += stepDuration;
          durations.push(stepDuration);
          cumulativeTimes.push(currentTime);

          timings.push({
            startTime,
            endTime: currentTime,
            type: step.type,
          });
        }

        // Adjust timings to match total audio duration
        if (currentTime > 0 && totalDuration > 0) {
          const ratio = totalDuration / currentTime;

          // Adjust all timings proportionally
          timings.forEach((timing, i) => {
            timing.startTime *= ratio;
            timing.endTime *= ratio;
          });
        }

        stepDurationsRef.current = durations;
        stepTimingsRef.current = timings;
        cumulativeTimesRef.current = cumulativeTimes;

        setPlayerState((prev) => ({
          ...prev,
          isGeneratingAudio: false,
          fullAudioReady: true,
          totalDuration: totalDuration,
        }));

        // Create and set up the main audio element
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.load();
        }

        console.log("Step timings calculated:", timings);
      } catch (error) {
        console.error("Error generating full audio:", error);
        setPlayerState((prev) => ({
          ...prev,
          isGeneratingAudio: false,
        }));
        alert(
          `Error generating audio: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    generateFullAudio();

    return () => {
      // Clean up the URL on unmount
      if (fullAudioUrlRef.current) {
        URL.revokeObjectURL(fullAudioUrlRef.current);
      }
    };
  }, [meditation, fileStorage]);

  // Setup audio element once
  useEffect(() => {
    // Create audio element
    const audio = new Audio();

    // Set up audio event listeners
    audio.addEventListener("ended", handleAudioEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    // Set ref
    audioRef.current = audio;

    // Cleanup
    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleAudioEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current = null;
    };
  }, []);

  // Handle audio ended event
  const handleAudioEnded = () => {
    console.log("Audio ended");
    pausePlayback();
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: false,
      currentStepIndex: 0,
      progress: 0,
      currentTime: 0,
    }));
  };

  // Simplify findCurrentStepIndex by using array findIndex directly
  const findCurrentStepIndex = (currentTime: number): number => {
    return (
      stepTimingsRef.current.findIndex(
        (t) => currentTime >= t.startTime && currentTime < t.endTime
      ) || 0
    );
  };

  // Handle audio timeupdate event
  const handleTimeUpdate = () => {
    if (audioRef.current && playerState.fullAudioReady) {
      const currentTime = audioRef.current.currentTime;
      const totalDuration = audioRef.current.duration;
      const progress = (currentTime / totalDuration) * 100;

      // Find current step based on time
      const currentStepIndex = findCurrentStepIndex(currentTime);

      setPlayerState((prev) => ({
        ...prev,
        currentTime,
        progress: Math.min(progress, 100),
        currentStepIndex,
      }));
    } else if (audioRef.current) {
      // Fallback for when full audio isn't ready yet
      const currentStepIndex = currentStepIndexRef.current;
      const previousTime =
        currentStepIndex > 0
          ? cumulativeTimesRef.current[currentStepIndex - 1]
          : 0;

      const currentTime = previousTime + audioRef.current.currentTime;
      const totalDuration =
        cumulativeTimesRef.current[cumulativeTimesRef.current.length - 1] || 1;
      const progress = (currentTime / totalDuration) * 100;

      setPlayerState((prev) => ({
        ...prev,
        currentTime,
        progress: Math.min(progress, 100),
      }));
    }
  };

  // Start or resume playback
  const startPlayback = () => {
    if (!playerState.fullAudioReady) {
      console.warn("Cannot start playback, full audio not ready yet");
      return;
    }

    isPlayingRef.current = true;
    setPlayerState((prev) => ({ ...prev, isPlaying: true }));

    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        pausePlayback();
      });
    }
  };

  // Pause playback
  const pausePlayback = () => {
    isPlayingRef.current = false;
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));

    // Pause audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Clear pause timer if active
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  };

  // Stop playback completely
  const stopPlayback = () => {
    pausePlayback();

    // Reset state
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: false,
      currentStepIndex: 0,
      progress: 0,
      currentTime: 0,
    }));

    // Update ref
    currentStepIndexRef.current = 0;

    // Reset audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Skip forward/backward
  const seekRelative = (seconds: number) => {
    if (audioRef.current && playerState.fullAudioReady) {
      const newTime = Math.max(
        0,
        Math.min(
          audioRef.current.currentTime + seconds,
          audioRef.current.duration
        )
      );
      audioRef.current.currentTime = newTime;
    }
  };

  // Seek to a specific step
  const seekToStep = (stepIndex: number) => {
    if (
      stepIndex < 0 ||
      stepIndex >= meditation.steps.length ||
      !playerState.fullAudioReady ||
      !audioRef.current
    )
      return;

    console.log(`Seeking to step ${stepIndex}`);

    // Get the timing for this step
    const stepTiming = stepTimingsRef.current[stepIndex];
    if (!stepTiming) {
      console.error(`No timing information for step ${stepIndex}`);
      return;
    }

    // Set audio playback position to the start of the selected step
    audioRef.current.currentTime = stepTiming.startTime;

    // Update state
    setPlayerState((prev) => ({
      ...prev,
      currentStepIndex: stepIndex,
    }));
  };

  // Consolidate time formatting into a helper function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Simplify progress bar click handler
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickPercentage = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = clickPercentage * audioRef.current.duration;
  };

  // Simplify downloadMeditation by removing redundant URL check
  const downloadMeditation = async () => {
    try {
      setPlayerState((prev) => ({ ...prev, isDownloading: true }));
      const url =
        fullAudioUrlRef.current ||
        (await exportMeditationAudio(meditation, fileStorage));

      const fileName = `${meditation.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_meditation.wav`;

      downloadAudioFile(url, fileName);
    } catch (error) {
      console.error("Error downloading meditation:", error);
      alert(
        `Error downloading meditation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setPlayerState((prev) => ({ ...prev, isDownloading: false }));
    }
  };

  // In the JSX, extract repeated loading/disabled conditions
  const isDisabled = !playerState.fullAudioReady;
  const isLoading = playerState.isGeneratingAudio;

  // Simplify progress display logic by precalculating values
  const { currentTime, totalDuration } = playerState;
  const timeDisplay = `${formatTime(currentTime)} / ${formatTime(
    totalDuration
  )}`;

  return (
    <Card className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-1" size={16} />
          Back
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={downloadMeditation}
          disabled={isDisabled}
          className="text-muted-foreground"
        >
          {isLoading ? (
            <Loader className="mr-1 animate-spin" size={16} />
          ) : (
            <Download className="mr-1" size={16} />
          )}
          {isLoading ? "Exporting..." : "Download Audio"}
        </Button>
      </div>

      <h1 className="text-2xl font-medium text-center mb-6">
        {meditation.title}
      </h1>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader className="animate-spin mb-4" size={32} />
          <p className="text-muted-foreground">
            Generating meditation audio...
          </p>
        </div>
      )}

      {/* Meditation script display */}
      {!isLoading && (
        <div className="mb-8 max-h-[60vh] overflow-y-auto p-2">
          <div className="space-y-2">
            {meditation.steps.map((step, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded transition-colors cursor-pointer hover:bg-muted/50",
                  playerState.currentStepIndex === idx &&
                    "bg-muted border-l-4 border-primary"
                )}
                onClick={() => seekToStep(idx)}
              >
                {step.type === "heading" && (
                  <div
                    className={cn(
                      "font-medium",
                      step.level === 1
                        ? "text-xl"
                        : step.level === 2
                        ? "text-lg"
                        : "text-base"
                    )}
                  >
                    {step.text}
                  </div>
                )}

                {step.type === "speech" && <p>{step.text}</p>}

                {step.type === "pause" && (
                  <p className="text-muted-foreground italic">
                    {step.duration}s pause
                    {step.canExtend && " (can be extended)"}
                    {step.waitForUserInput && " (waiting for user)"}
                  </p>
                )}

                {step.type === "direction" && (
                  <p className="text-primary italic">{step.text}</p>
                )}

                {step.type === "aside" && (
                  <p className="text-muted-foreground italic">{step.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playback controls */}
      {!isLoading && (
        <div className="space-y-4">
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
              <span>{timeDisplay}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => seekRelative(-15)}
              disabled={isDisabled}
              aria-label="Backward 15 seconds"
            >
              <SkipBack size={20} />
            </Button>

            <Button
              variant="default"
              size="lg"
              className="rounded-full w-12 h-12"
              onClick={playerState.isPlaying ? pausePlayback : startPlayback}
              aria-label={playerState.isPlaying ? "Pause" : "Play"}
              disabled={isDisabled}
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
              disabled={isDisabled}
              aria-label="Forward 15 seconds"
            >
              <SkipForward size={20} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
