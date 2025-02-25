import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meditation, MeditationStep } from "./NadaPage";
import { FileStorageApi } from "@/lib/file-storage";
import { Buffer } from "buffer";

// Internal components
function ProgressHeader({
  progress,
  title,
}: {
  progress: number;
  title: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Synthesizing Audio</h2>
          <p className="text-muted-foreground">
            {progress < 100
              ? `Creating "${title}" meditation audio...`
              : "Synthesis complete!"}
          </p>
        </div>
        <div className="text-lg font-medium">{Math.round(progress)}%</div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

const getHeadingSize = (level: number) => {
  switch (level) {
    case 1:
      return "text-3xl leading-relaxed";
    case 2:
      return "text-xl leading-relaxed";
    case 3:
      return "text-md leading-relaxed";
    default:
      return "";
  }
};

interface MeditationStepProps {
  section: MeditationStep;
  status: "pending" | "processing" | "complete";
  onPreview?: () => void;
}

function MeditationStepDisplay({
  section,
  status,
  onPreview,
}: MeditationStepProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "complete":
        return "bg-green-50 border-green-200";
      case "processing":
        return "bg-blue-50 border-blue-200 animate-pulse";
      default:
        return "bg-white/50";
    }
  };

  if (section.type === "heading") {
    return (
      <div className={cn("font-medium", getHeadingSize(section.level || 1))}>
        {section.text}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "p-3 rounded-sm border shadow-none flex justify-between items-start",
        getStatusStyles(),
        section.type === "aside" && "italic",
        section.type === "direction" && "text-primary"
      )}
    >
      <div className="flex-1">
        {section.type === "speech" && <div>{section.text}</div>}
        {section.type === "pause" && (
          <div className="text-muted-foreground">
            {section.duration}s pause
            {section.canExtend && " (can be extended)"}
            {section.waitForUserInput && " (waiting for user)"}
          </div>
        )}
        {section.type === "sound" && (
          <div className="text-muted-foreground">
            {section.soundId}
            {section.description && (
              <span className="text-sm ml-2">({section.description})</span>
            )}
          </div>
        )}
        {section.type === "aside" && (
          <div className="text-muted-foreground">{section.text}</div>
        )}
        {section.type === "direction" && <div>{section.text}</div>}
      </div>
      {status === "complete" && onPreview && section.type === "speech" && (
        <Button variant="ghost" size="sm" className="ml-2" onClick={onPreview}>
          <Play className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}

interface SynthesisProgressProps {
  meditation: Meditation;
  voiceSettings: {
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  };
  onCancel: () => void;
  fileStorage: FileStorageApi;
  sessionId?: string;
  onMeditationUpdate: (updatedMeditation: Meditation) => void;
}

export function SynthesisProgress({
  meditation,
  voiceSettings,
  onCancel,
  fileStorage,
  sessionId,
  onMeditationUpdate,
}: SynthesisProgressProps) {
  // State management
  const [progress, setProgress] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const synthesisStartedRef = useRef<boolean>(false);

  const { title, steps } = meditation;

  // Start synthesis process when component mounts
  useEffect(() => {
    // Only start synthesis if it hasn't been started yet
    if (synthesisStartedRef.current) {
      return;
    }

    synthesisStartedRef.current = true;

    const startSynthesis = async () => {
      try {
        // Initialize state
        setIsSynthesizing(true);
        setError(null);
        setProgress(0);

        // Reset audioFileId for all steps
        meditation.steps.forEach((step) => {
          step.audioFileId = undefined;
        });

        // Notify parent about the reset
        onMeditationUpdate({ ...meditation });

        // Create a new AbortController for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Make API request
        const response = await fetch("/api/synthesize-meditation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sections: steps,
            voiceSettings,
            title,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Synthesis request failed");
        }

        // Get the response as a stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get stream reader");
        }

        // Process the stream
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk and add it to our buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete messages in the buffer
          const messages = buffer.split("\n");
          buffer = messages.pop() || ""; // Keep the last incomplete message in the buffer

          for (const message of messages) {
            if (!message.trim()) continue;

            try {
              const data = JSON.parse(message);

              if (data.type === "metadata") {
                // Handle metadata if needed
              } else if (data.type === "progress") {
                setProgress(data.progress);
              } else if (data.type === "audio") {
                try {
                  // Create a Blob from the base64 audio data
                  const audioBlob = new Blob(
                    [Buffer.from(data.data, "base64")],
                    { type: "audio/mp3" }
                  );

                  // Save the audio blob to file storage
                  const fileId = await fileStorage.saveFile(audioBlob, {
                    projectId: "NADA",
                    groupId: sessionId,
                    contentType: "audio/mp3",
                  });

                  // Update the meditation step with the audio file ID
                  meditation.steps[data.sectionIndex].audioFileId = fileId;

                  // Notify parent about the update
                  onMeditationUpdate({ ...meditation });
                } catch (storageError) {
                  console.error("Error storing audio file:", storageError);
                  // Still mark as completed by setting a placeholder ID
                  meditation.steps[data.sectionIndex].audioFileId =
                    "error-" + Date.now();

                  // Notify parent about the update
                  onMeditationUpdate({ ...meditation });
                }
              } else if (data.type === "error") {
                setError(data.message);
              } else if (data.type === "complete") {
                setProgress(100);
              }
            } catch (e) {
              console.error("Error parsing message:", e);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Synthesis aborted");
        } else {
          console.error("Synthesis error:", error);
          setError(
            error instanceof Error ? error.message : "An unknown error occurred"
          );
        }
      } finally {
        setIsSynthesizing(false);
        abortControllerRef.current = null;
      }
    };

    startSynthesis();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array to ensure it only runs once

  // Event handlers
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsSynthesizing(false);
    }
    onCancel();
  };

  const previewSection = async (index: number) => {
    const step = meditation.steps[index];

    if (!step.audioFileId) {
      console.error("No audio file ID available for this section");
      return;
    }

    try {
      const storedFile = await fileStorage.getFile(step.audioFileId);
      if (!storedFile || !storedFile.data) {
        console.error("Audio file not found in storage");
        return;
      }

      // Create audio from stored file data
      let audioData: string;

      if (storedFile.data instanceof Blob) {
        // Convert Blob to base64 for playback
        const arrayBuffer = await storedFile.data.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        audioData = base64;
      } else if (typeof storedFile.data === "string") {
        // Already a base64 string
        audioData = storedFile.data;
      } else {
        throw new Error("Unsupported audio data format");
      }

      const url = URL.createObjectURL(
        new Blob([Buffer.from(audioData, "base64")])
      );
      const audio = new Audio(url);

      audio.onended = () => {
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Helper functions
  const getStepStatus = (index: number) => {
    if (meditation.steps[index].audioFileId) return "complete";
    if (index === currentlyPlaying) return "processing";
    return "pending";
  };

  return (
    <Card className="p-6 space-y-6">
      <h1 className="text-2xl font-medium text-center mb-4">{title}</h1>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="text-red-600 gap-2"
          disabled={!isSynthesizing}
        >
          <StopCircle className="h-4 w-4" />
          Cancel Synthesis
        </Button>
      </div>

      <ProgressHeader progress={progress} title={title} />

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
      )}

      <div className="space-y-2">
        {steps.map((section, index) => (
          <MeditationStepDisplay
            key={`${index}-${section.audioFileId || "pending"}`}
            section={section}
            status={getStepStatus(index)}
            onPreview={
              getStepStatus(index) === "complete" && section.type === "speech"
                ? () => previewSection(index)
                : undefined
            }
          />
        ))}
      </div>

      <div className="text-sm text-muted-foreground text-center">
        {progress < 100
          ? "Estimated time remaining: ~2 minutes"
          : "Synthesis complete!"}
      </div>
    </Card>
  );
}
