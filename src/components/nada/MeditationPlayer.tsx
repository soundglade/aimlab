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
  });

  // References for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepDurationsRef = useRef<number[]>([]);
  const cumulativeTimesRef = useRef<number[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const currentAudioUrlRef = useRef<string | null>(null);
  const currentStepIndexRef = useRef<number>(0);

  // Update ref when state changes
  useEffect(() => {
    currentStepIndexRef.current = playerState.currentStepIndex;
  }, [playerState.currentStepIndex]);

  // Calculate step durations and total duration on mount
  useEffect(() => {
    const calculateDurations = async () => {
      const durations: number[] = [];
      const cumulativeTimes: number[] = [];
      let totalTime = 0;

      for (const step of meditation.steps) {
        let stepDuration = 0;

        if (step.type === "speech" && step.audioFileId) {
          // For speech steps, we'll estimate duration based on text length
          // (we'll update this with actual duration when audio loads)
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
    };

    calculateDurations();
  }, [meditation]);

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
    console.log("Audio ended, moving to next step");
    // Important: use the ref value here, not the state value which might be stale
    const nextIndex = currentStepIndexRef.current + 1;
    if (isPlayingRef.current) {
      playStep(nextIndex);
    }
  };

  // Handle audio timeupdate event
  const handleTimeUpdate = () => {
    if (audioRef.current) {
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

  // Play an audio file
  const playAudioFile = async (fileId: string) => {
    try {
      if (!audioRef.current) return;

      // Cleanup previous audio
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }

      // Get the file from storage
      const storedFile = await fileStorage.getFile(fileId);
      if (!storedFile || !storedFile.data) {
        throw new Error("Audio file not found in storage");
      }

      // Process the audio data
      let audioData: string;
      if (storedFile.data instanceof Blob) {
        const arrayBuffer = await storedFile.data.arrayBuffer();
        audioData = Buffer.from(arrayBuffer).toString("base64");
      } else if (typeof storedFile.data === "string") {
        audioData = storedFile.data;
      } else {
        throw new Error("Unsupported audio data format");
      }

      // Create blob and URL
      const audioBlob = new Blob([Buffer.from(audioData, "base64")], {
        type: "audio/mp3",
      });
      const url = URL.createObjectURL(audioBlob);
      currentAudioUrlRef.current = url;

      // Set the audio source
      audioRef.current.src = url;

      // Play the audio
      try {
        await audioRef.current.play();
        console.log("Audio playback started");

        // Update duration with actual audio duration once loaded
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          console.log(
            "Updating duration for step",
            currentStepIndexRef.current,
            "to",
            audioRef.current.duration
          );
          const stepIndex = currentStepIndexRef.current;

          // Update step duration
          stepDurationsRef.current[stepIndex] = audioRef.current.duration;

          // Recalculate cumulative times
          let total = 0;
          const newCumulativeTimes = stepDurationsRef.current.map(
            (duration) => {
              total += duration;
              return total;
            }
          );

          cumulativeTimesRef.current = newCumulativeTimes;

          // Update total duration in state
          setPlayerState((prev) => ({
            ...prev,
            totalDuration: total,
          }));
        }
      } catch (playError) {
        console.error("Error playing audio:", playError);
        throw playError;
      }
    } catch (error) {
      console.error("Error preparing audio:", error);
      // Move to next step on error if we're still playing
      if (isPlayingRef.current) {
        const nextIndex = currentStepIndexRef.current + 1;
        playStep(nextIndex);
      }
    }
  };

  // Main playback control function
  const playStep = async (index: number) => {
    if (index >= meditation.steps.length) {
      // End of meditation reached
      stopPlayback();
      return;
    }

    const step = meditation.steps[index];
    console.log(`Playing step ${index}:`, step.type);

    // Update state and ref for current step
    setPlayerState((prev) => ({
      ...prev,
      currentStepIndex: index,
    }));
    currentStepIndexRef.current = index;

    // Clear any existing pause timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (step.type === "speech" && step.audioFileId) {
      // Play the audio file
      await playAudioFile(step.audioFileId);
    } else if (step.type === "pause") {
      // For pause steps, we use a timer
      const pauseDuration = step.duration * 1000; // convert to ms

      // Clear any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        if (currentAudioUrlRef.current) {
          URL.revokeObjectURL(currentAudioUrlRef.current);
          currentAudioUrlRef.current = null;
        }
        audioRef.current.src = "";
      }

      // Update progress during pause
      const startTime = Date.now();
      const previousTime =
        index > 0 ? cumulativeTimesRef.current[index - 1] : 0;

      const updatePauseProgress = () => {
        if (!isPlayingRef.current) return;

        const elapsed = Math.min(
          (Date.now() - startTime) / 1000,
          step.duration
        );
        const currentTime = previousTime + elapsed;
        const totalDuration =
          cumulativeTimesRef.current[cumulativeTimesRef.current.length - 1] ||
          1;
        const progress = (currentTime / totalDuration) * 100;

        setPlayerState((prev) => ({
          ...prev,
          currentTime,
          progress: Math.min(progress, 100),
        }));

        if (elapsed < step.duration && isPlayingRef.current) {
          requestAnimationFrame(updatePauseProgress);
        }
      };

      // Start updating progress
      updatePauseProgress();

      // Set timeout to move to next step after pause completes
      pauseTimerRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          console.log("Pause complete, moving to next step");
          playStep(index + 1);
        }
      }, pauseDuration);
    } else {
      // For other step types (headings, etc.), just move to the next step
      if (isPlayingRef.current) {
        // Small delay to prevent stack overflow with consecutive non-playable steps
        setTimeout(() => {
          playStep(index + 1);
        }, 10);
      }
    }
  };

  // Start or resume playback
  const startPlayback = () => {
    isPlayingRef.current = true;
    setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    playStep(playerState.currentStepIndex);
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
    // Calculate new time
    const newTime = Math.max(
      0,
      Math.min(playerState.currentTime + seconds, playerState.totalDuration)
    );
    seekToTime(newTime);
  };

  // Seek to a specific time
  const seekToTime = (timeInSeconds: number) => {
    if (cumulativeTimesRef.current.length === 0) return;

    // Find which step this time falls into
    let stepIndex = 0;
    for (let i = 0; i < cumulativeTimesRef.current.length; i++) {
      if (cumulativeTimesRef.current[i] > timeInSeconds) {
        stepIndex = i;
        break;
      }
      if (i === cumulativeTimesRef.current.length - 1) {
        stepIndex = i;
      }
    }

    console.log(`Seeking to time ${timeInSeconds}, step index ${stepIndex}`);

    // Remember if we were playing
    const wasPlaying = isPlayingRef.current;

    // Pause current playback
    pausePlayback();

    // Update state and ref
    setPlayerState((prev) => ({
      ...prev,
      currentStepIndex: stepIndex,
      currentTime: timeInSeconds,
      progress: (timeInSeconds / (prev.totalDuration || 1)) * 100,
    }));
    currentStepIndexRef.current = stepIndex;

    // Resume playback if it was playing
    if (wasPlaying) {
      // Short delay to ensure state is updated
      setTimeout(() => {
        startPlayback();
      }, 50);
    }
  };

  // Seek to a specific step
  const seekToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= meditation.steps.length) return;

    console.log(`Seeking to step ${stepIndex}`);

    // Get the time at the start of this step
    const previousTime =
      stepIndex > 0 ? cumulativeTimesRef.current[stepIndex - 1] : 0;

    // Remember if we were playing
    const wasPlaying = isPlayingRef.current;

    // Pause current playback
    pausePlayback();

    // Update state and ref
    setPlayerState((prev) => ({
      ...prev,
      currentStepIndex: stepIndex,
      currentTime: previousTime,
      progress: (previousTime / (prev.totalDuration || 1)) * 100,
    }));
    currentStepIndexRef.current = stepIndex;

    // Resume playback if it was playing
    if (wasPlaying) {
      // Short delay to ensure state is updated
      setTimeout(() => {
        startPlayback();
      }, 50);
    }
  };

  // Format time display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      pausePlayback();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }

      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }
    };
  }, []);

  // Downloads the meditation as a single audio file
  const downloadMeditation = async () => {
    try {
      // Start download process and update UI
      setPlayerState((prev) => ({ ...prev, isDownloading: true }));

      // Export the meditation audio with progress updates
      const fileName = `${meditation.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_meditation.wav`;

      const url = await exportMeditationAudio(meditation, fileStorage, {
        onProgress: (progress) => {
          // Optional: Update progress in UI if desired
          console.log(`Export progress: ${progress}%`);
        },
        fileName,
      });

      // Download the file
      downloadAudioFile(url, fileName);

      // Clean up the URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
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
          disabled={playerState.isDownloading}
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

      {/* Meditation script display */}
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

      {/* Playback controls */}
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={playerState.progress} className="h-2" />
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
          >
            <SkipBack size={20} />
          </Button>

          <Button
            variant="default"
            size="lg"
            className="rounded-full w-12 h-12"
            onClick={playerState.isPlaying ? pausePlayback : startPlayback}
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
            aria-label="Forward 15 seconds"
          >
            <SkipForward size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
