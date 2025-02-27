import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Meditation } from "./NadaPage";
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
import { downloadAudioFile } from "./utils/audioExporter";
import * as meditationTimeline from "./utils/meditationTimeline";

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
  isLoading: boolean; // Track loading state
  audioReady: boolean; // Track if the audio is ready
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
    totalDuration: meditation.timeline?.totalDurationMs
      ? meditation.timeline.totalDurationMs / 1000
      : 0, // Convert to seconds
    isDownloading: false,
    isLoading: true,
    audioReady: false,
  });

  // References for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const currentStepIndexRef = useRef<number>(0);
  const audioUrlRef = useRef<string | null>(null);

  // Update ref when state changes
  useEffect(() => {
    currentStepIndexRef.current = playerState.currentStepIndex;
  }, [playerState.currentStepIndex]);

  // Load the full audio file
  useEffect(() => {
    const loadFullAudio = async () => {
      try {
        setPlayerState((prev) => ({ ...prev, isLoading: true }));

        if (!meditation.fullAudioFileId) {
          throw new Error("No full audio file ID found in the meditation");
        }

        // Get the full audio file from storage
        const storedFile = await fileStorage.getFile(
          meditation.fullAudioFileId
        );
        if (!storedFile || !storedFile.data) {
          throw new Error("Full audio file not found in storage");
        }

        // Create a blob URL from the stored file
        let audioBlob: Blob;
        if (storedFile.data instanceof Blob) {
          audioBlob = storedFile.data;
        } else if (typeof storedFile.data === "string") {
          audioBlob = new Blob([Buffer.from(storedFile.data, "base64")], {
            type: "audio/wav",
          });
        } else {
          throw new Error("Unsupported audio data format");
        }

        // Create a URL for the blob
        const url = URL.createObjectURL(audioBlob);
        audioUrlRef.current = url;

        // Create and set up the main audio element
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.load();
        }

        setPlayerState((prev) => ({
          ...prev,
          isLoading: false,
          audioReady: true,
          totalDuration: meditation.timeline?.totalDurationMs
            ? meditation.timeline.totalDurationMs / 1000
            : prev.totalDuration,
        }));

        console.log("Full audio loaded");
      } catch (error) {
        console.error("Error loading full audio:", error);
        setPlayerState((prev) => ({
          ...prev,
          isLoading: false,
        }));
        alert(
          `Error loading audio: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    loadFullAudio();

    return () => {
      // Clean up the URL on unmount
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
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

  // Handle audio timeupdate event
  const handleTimeUpdate = () => {
    if (audioRef.current && playerState.audioReady && meditation.timeline) {
      const currentTime = audioRef.current.currentTime;
      const totalDuration = audioRef.current.duration;
      const progress = (currentTime / totalDuration) * 100;

      // Find current step based on time (convert seconds to ms)
      const currentTimeMs = currentTime * 1000;
      const currentStepIndex = meditationTimeline.getStepIndexAtTime(
        meditation.timeline.timings,
        currentTimeMs
      );

      setPlayerState((prev) => ({
        ...prev,
        currentTime,
        progress: Math.min(progress, 100),
        currentStepIndex:
          currentStepIndex >= 0 ? currentStepIndex : prev.currentStepIndex,
      }));
    }
  };

  // Start or resume playback
  const startPlayback = () => {
    if (!playerState.audioReady) {
      console.warn("Cannot start playback, audio not ready yet");
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
    if (audioRef.current && playerState.audioReady) {
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
      !playerState.audioReady ||
      !audioRef.current ||
      !meditation.timeline
    )
      return;

    console.log(`Seeking to step ${stepIndex}`);

    // Get the time for this step
    const startTimeMs = meditationTimeline.getTimeForStep(
      meditation.timeline.timings,
      stepIndex
    );

    // Set audio playback position to the start of the selected step (convert ms to seconds)
    audioRef.current.currentTime = startTimeMs / 1000;

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

  // Download the meditation audio
  const downloadMeditation = async () => {
    try {
      setPlayerState((prev) => ({ ...prev, isDownloading: true }));

      if (!meditation.fullAudioFileId) {
        throw new Error("No full audio file ID found in the meditation");
      }

      // Get the full audio file from storage
      const storedFile = await fileStorage.getFile(meditation.fullAudioFileId);
      if (!storedFile || !storedFile.data) {
        throw new Error("Full audio file not found in storage");
      }

      // Create a blob URL from the stored file
      let audioBlob: Blob;
      if (storedFile.data instanceof Blob) {
        audioBlob = storedFile.data;
      } else if (typeof storedFile.data === "string") {
        audioBlob = new Blob([Buffer.from(storedFile.data, "base64")], {
          type: "audio/wav",
        });
      } else {
        throw new Error("Unsupported audio data format");
      }

      // Create a URL for the blob
      const url = URL.createObjectURL(audioBlob);

      const fileName = `${meditation.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_meditation.wav`;

      // Download the file
      downloadAudioFile(url, fileName);

      // Clean up the URL
      URL.revokeObjectURL(url);
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
  const isDisabled = !playerState.audioReady;
  const isLoading = playerState.isLoading;

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
          {playerState.isDownloading ? (
            <Loader className="mr-1 animate-spin" size={16} />
          ) : (
            <Download className="mr-1" size={16} />
          )}
          {playerState.isDownloading ? "Downloading..." : "Download Audio"}
        </Button>
      </div>

      <h1 className="text-2xl font-medium text-center mb-6">
        {meditation.title}
      </h1>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader className="animate-spin mb-4" size={32} />
          <p className="text-muted-foreground">Loading meditation audio...</p>
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
