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
  const currentAudioUrlRef = useRef<string | null>(null);
  const currentStepIndexRef = useRef<number>(0);
  const fullAudioUrlRef = useRef<string | null>(null);
  const stepTimingsRef = useRef<StepTiming[]>([]);

  // Update ref when state changes
  useEffect(() => {
    currentStepIndexRef.current = playerState.currentStepIndex;
  }, [playerState.currentStepIndex]);

  // Generate the full audio file when component mounts
  useEffect(() => {
    const generateFullAudio = async () => {
      try {
        setPlayerState((prev) => ({
          ...prev,
          isGeneratingAudio: true,
        }));

        // Generate the full audio file
        const url = await exportMeditationAudio(meditation, fileStorage, {
          onProgress: (progress) => {
            console.log(`Audio generation progress: ${progress}%`);
          },
        });

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

        const totalDuration = tempAudio.duration || 0;

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

  // Calculate step durations and total duration on mount (as fallback)
  useEffect(() => {
    const calculateDurations = async () => {
      // Only do this if we don't have the full audio yet
      if (!playerState.fullAudioReady) {
        const durations: number[] = [];
        const cumulativeTimes: number[] = [];
        let totalTime = 0;

        for (const step of meditation.steps) {
          let stepDuration = 0;

          if (step.type === "speech") {
            // Estimate duration based on text length
            stepDuration = step.text.length / 15; // rough estimate
          } else if (step.type === "pause") {
            stepDuration = step.duration;
          }

          durations.push(stepDuration);
          totalTime += stepDuration;
          cumulativeTimes.push(totalTime);
        }

        stepDurationsRef.current = durations;
        cumulativeTimesRef.current = cumulativeTimes;

        setPlayerState((prev) => ({
          ...prev,
          totalDuration: totalTime,
        }));
      }
    };

    calculateDurations();
  }, [meditation, playerState.fullAudioReady]);

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

  // Find the current step index based on current time
  const findCurrentStepIndex = (currentTime: number): number => {
    const timings = stepTimingsRef.current;

    // Skip non-audio steps when determining current step
    const audioStepTimings = timings.filter(
      (timing) => timing.type === "speech" || timing.type === "pause"
    );

    // Find the current audio step
    for (let i = 0; i < audioStepTimings.length; i++) {
      if (currentTime < audioStepTimings[i].endTime) {
        // Find the corresponding index in the original steps array
        const originalIndex = timings.findIndex(
          (t) =>
            t.startTime === audioStepTimings[i].startTime &&
            t.endTime === audioStepTimings[i].endTime
        );
        return originalIndex >= 0 ? originalIndex : i;
      }
    }

    // If we're past all audio steps, find the last relevant step
    for (let i = timings.length - 1; i >= 0; i--) {
      if (timings[i].type === "speech" || timings[i].type === "pause") {
        return i;
      }
    }

    return 0; // Default to first step if nothing else matches
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

  // Format time display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Seek to a specific time based on progress bar click
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerState.fullAudioReady || !audioRef.current) return;

    // Get the progress bar element
    const progressBar = e.currentTarget;

    // Calculate the click position as a percentage of the bar width
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const clickPercentage = clickPosition / rect.width;

    // Calculate the target time based on the total duration
    const targetTime = clickPercentage * audioRef.current.duration;

    // Set the audio time
    audioRef.current.currentTime = targetTime;

    console.log(
      `Seeking to ${formatTime(targetTime)} (${Math.round(
        clickPercentage * 100
      )}%)`
    );
  };

  // Downloads the meditation as a single audio file
  const downloadMeditation = async () => {
    try {
      // Start download process and update UI
      setPlayerState((prev) => ({ ...prev, isDownloading: true }));

      // If we already have the full audio, use that
      let url: string;
      if (fullAudioUrlRef.current) {
        url = fullAudioUrlRef.current;
      } else {
        // Otherwise export the meditation audio with progress updates
        url = await exportMeditationAudio(meditation, fileStorage, {
          onProgress: (progress) => {
            console.log(`Export progress: ${progress}%`);
          },
        });
      }

      // Download the file
      const fileName = `${meditation.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_meditation.wav`;
      downloadAudioFile(url, fileName);

      // Don't revoke the URL if it's our main playback URL
      if (url !== fullAudioUrlRef.current) {
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      }
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
          disabled={playerState.isDownloading || playerState.isGeneratingAudio}
          className="text-muted-foreground"
        >
          {playerState.isDownloading ? (
            <Loader className="mr-1 animate-spin" size={16} />
          ) : (
            <Download className="mr-1" size={16} />
          )}
          {playerState.isDownloading ? "Exporting..." : "Download Audio"}
        </Button>
      </div>

      <h1 className="text-2xl font-medium text-center mb-6">
        {meditation.title}
      </h1>

      {/* Loading state */}
      {playerState.isGeneratingAudio && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader className="animate-spin mb-4" size={32} />
          <p className="text-muted-foreground">
            Generating meditation audio...
          </p>
        </div>
      )}

      {/* Meditation script display */}
      {!playerState.isGeneratingAudio && (
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
      {!playerState.isGeneratingAudio && (
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
              <span>{formatTime(playerState.currentTime)}</span>
              <span>{formatTime(playerState.totalDuration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => seekRelative(-15)}
              aria-label="Backward 15 seconds"
              disabled={!playerState.fullAudioReady}
            >
              <SkipBack size={20} />
            </Button>

            <Button
              variant="default"
              size="lg"
              className="rounded-full w-12 h-12"
              onClick={playerState.isPlaying ? pausePlayback : startPlayback}
              aria-label={playerState.isPlaying ? "Pause" : "Play"}
              disabled={!playerState.fullAudioReady}
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
              aria-label="Forward 15 seconds"
              disabled={!playerState.fullAudioReady}
            >
              <SkipForward size={20} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
