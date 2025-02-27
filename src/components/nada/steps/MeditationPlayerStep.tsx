import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Meditation } from "../Nada";
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
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadAudioFile } from "../utils/audioExporter";
import * as meditationTimeline from "../utils/meditationTimeline";
import { getAudioBlob, createAudioUrl } from "../utils/audioUtils";
import { ShareResponse } from "../utils/shareService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MeditationPlayerProps {
  meditation: Meditation;
  fileStorage: FileStorageApi;
  onBack: () => void;
  onShareMeditation: () => Promise<ShareResponse>;
}

// Types for the player state
interface PlayerState {
  isPlaying: boolean;
  currentStepIndex: number;
  progress: number; // 0-100
  currentTimeMs: number; // in milliseconds
  totalDurationMs: number; // in milliseconds
  isDownloading: boolean; // Track download state
  isLoading: boolean; // Track loading state
  audioReady: boolean; // Track if the audio is ready
  isShareDialogOpen: boolean; // Track share dialog state
  shareMessage?: { type: "success" | "error"; content: string; url?: string }; // Track share result message
}

export function MeditationPlayerStep({
  meditation,
  fileStorage,
  onBack,
  onShareMeditation,
}: MeditationPlayerProps) {
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentStepIndex: 0,
    progress: 0,
    currentTimeMs: 0,
    totalDurationMs: meditation.timeline?.totalDurationMs || 0,
    isDownloading: false,
    isLoading: true,
    audioReady: false,
    isShareDialogOpen: false,
  });

  // References for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

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
        const url = createAudioUrl(storedFile.data);
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
          totalDurationMs:
            meditation.timeline?.totalDurationMs || prev.totalDurationMs,
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
      currentTimeMs: 0,
    }));
  };

  // Handle audio timeupdate event
  const handleTimeUpdate = () => {
    if (audioRef.current && playerState.audioReady && meditation.timeline) {
      const currentTimeSec = audioRef.current.currentTime;
      const currentTimeMs = currentTimeSec * 1000;
      const totalDurationSec = audioRef.current.duration;
      const totalDurationMs = totalDurationSec * 1000;
      const progress = (currentTimeSec / totalDurationSec) * 100;

      // Find current step based on time
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

  // Start or resume playback
  const startPlayback = () => {
    if (!playerState.audioReady) {
      console.warn("Cannot start playback, audio not ready yet");
      return;
    }

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
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));

    // Pause audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
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
      currentTimeMs: 0,
    }));

    // Reset audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Skip forward/backward
  const seekRelative = (secondsToAdd: number) => {
    if (audioRef.current && playerState.audioReady) {
      const msToAdd = secondsToAdd * 1000;
      const currentTimeMs = audioRef.current.currentTime * 1000;
      const durationMs = audioRef.current.duration * 1000;

      const newTimeMs = Math.max(
        0,
        Math.min(currentTimeMs + msToAdd, durationMs)
      );
      audioRef.current.currentTime = newTimeMs / 1000; // Convert back to seconds for the audio element
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
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
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
      const url = createAudioUrl(storedFile.data);

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

  // Handle share meditation
  const openShareDialog = () => {
    setPlayerState((prev) => ({ ...prev, isShareDialogOpen: true }));
  };

  const closeShareDialog = () => {
    setPlayerState((prev) => ({ ...prev, isShareDialogOpen: false }));
  };

  const confirmShare = async () => {
    try {
      // Call the share handler
      const response = await onShareMeditation();

      // Close the dialog
      closeShareDialog();

      // Show success message with the URL
      setPlayerState((prev) => ({
        ...prev,
        shareMessage: {
          type: "success",
          content: "Meditation shared successfully! Share using this link:",
          url: response.shareUrl,
        },
      }));
    } catch (error) {
      console.error("Error sharing meditation:", error);
      setPlayerState((prev) => ({
        ...prev,
        shareMessage: {
          type: "error",
          content: `Failed to share meditation: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      }));
    }
  };

  // In the JSX, extract repeated loading/disabled conditions
  const isDisabled = !playerState.audioReady;
  const isLoading = playerState.isLoading;

  // Simplify progress display logic by precalculating values
  const { currentTimeMs, totalDurationMs } = playerState;
  const timeDisplay = `${formatTime(currentTimeMs)} / ${formatTime(
    totalDurationMs
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

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openShareDialog}
            disabled={isDisabled}
            className="text-muted-foreground"
          >
            <Share2 className="mr-1" size={16} />
            Share Meditation
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
      </div>

      {/* Share Meditation Dialog */}
      <Dialog
        open={playerState.isShareDialogOpen}
        onOpenChange={closeShareDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Meditation</DialogTitle>
            <DialogDescription>
              You're about to share "{meditation.title}" with others.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">
              If you proceed, we'll generate a link that you can share with
              friends and family.
            </p>
            <p className="mb-4 text-muted-foreground">Please note:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>You won't be able to edit or delete it</li>
              <li>This is a temporary link that will expire after 7 days</li>
              <li>
                Anyone with the link will be able to access this meditation
              </li>
            </ul>
          </div>

          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button variant="outline" onClick={closeShareDialog}>
              Cancel
            </Button>
            <Button onClick={confirmShare}>Ok, create link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h1 className="text-2xl font-medium text-center mb-6">
        {meditation.title}
      </h1>

      {/* Share result message */}
      {playerState.shareMessage && (
        <div
          className={cn(
            "mb-6 p-4 rounded-lg text-center border",
            playerState.shareMessage.type === "success"
              ? "bg-background border-border text-foreground"
              : "bg-destructive/10 border-destructive/50 text-destructive"
          )}
        >
          <p>
            {playerState.shareMessage.content}
            {playerState.shareMessage.url && (
              <a
                href={playerState.shareMessage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline"
              >
                {playerState.shareMessage.url}
              </a>
            )}
          </p>
        </div>
      )}

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
