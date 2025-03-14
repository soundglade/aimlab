import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meditation, MeditationStep } from "../../Rila";
import { FileStorageApi } from "@/lib/file-storage";
import * as synthesisService from "../../utils/synthesisService";

// Types
export type StepStatus = "pending" | "processing" | "complete";

// UI utility functions
export const getHeadingSize = (level: number): string => {
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

// UI-specific helper
export function getStepStatus(
  step: MeditationStep,
  currentlyPlayingIndex: number | null,
  index: number
): StepStatus {
  if (step.audioFileId) return "complete";
  if (currentlyPlayingIndex === index) return "processing";
  return "pending";
}

// UI styling function
export const getStatusStyles = (status: StepStatus): string => {
  switch (status) {
    case "complete":
      return "bg-primary/10 border-primary/20";
    case "processing":
      return "bg-secondary/10 border-secondary/20 animate-pulse";
    default:
      return "bg-white/50";
  }
};

// Small component for play button
export function PlayButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="ml-2"
      onClick={onClick}
      aria-label="Play audio"
    >
      <Play className="h-4 w-4" />
    </Button>
  );
}

export interface MeditationStepProps {
  section: MeditationStep;
  status: StepStatus;
  onPreview?: () => void;
}

export function MeditationStepDisplay({
  section,
  status,
  onPreview,
}: MeditationStepProps) {
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
        getStatusStyles(status),
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
        <PlayButton onClick={onPreview} />
      )}
    </Card>
  );
}

// Hook for handling audio preview functionality
export function useAudioPreview(
  meditation: Meditation,
  fileStorage: FileStorageApi
) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);

  // Audio playback function
  const previewSection = async (index: number) => {
    const fileId = meditation.steps[index].audioFileId;
    if (!fileId) {
      console.error("No audio file ID available for this section");
      return;
    }

    try {
      setCurrentlyPlaying(index);
      await synthesisService.playAudio(fileStorage, fileId);
      setCurrentlyPlaying(null);
    } catch (error) {
      console.error("Error playing audio:", error);
      setCurrentlyPlaying(null);
    }
  };

  return {
    currentlyPlaying,
    previewSection,
  };
}
