import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, StopCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meditation, MeditationStep, SynthesisState } from "../Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { VoiceSettings } from "./voice/ttsTypes";
import * as synthesisService from "../utils/synthesisService";
import { useSynthesis } from "./synthesis/useSynthesis";

// Types
type StepStatus = "pending" | "processing" | "complete";

// UI utility functions
const getHeadingSize = (level: number): string => {
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
function getStepStatus(
  step: MeditationStep,
  currentlyPlayingIndex: number | null,
  index: number
): StepStatus {
  if (step.audioFileId) return "complete";
  if (currentlyPlayingIndex === index) return "processing";
  return "pending";
}

// UI styling function
const getStatusStyles = (status: StepStatus): string => {
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
function PlayButton({ onClick }: { onClick: () => void }) {
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

// Internal components
function ProgressHeader({
  progress,
  title,
  isGeneratingFullAudio,
}: {
  progress: number;
  title: string;
  isGeneratingFullAudio: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Synthesizing Audio</h2>
          <p className="text-muted-foreground">
            {progress < 90
              ? `Creating "${title}" meditation audio...`
              : progress < 100
              ? `Generating full audio file...`
              : "Synthesis complete!"}
          </p>
        </div>
        <div className="text-lg font-medium">{Math.round(progress)}%</div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

interface MeditationStepProps {
  section: MeditationStep;
  status: StepStatus;
  onPreview?: () => void;
}

function MeditationStepDisplay({
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

interface SynthesisProgressProps {
  meditation: Meditation;
  voiceSettings: VoiceSettings;
  onCancel: () => void;
  onComplete: () => void;
  fileStorage: FileStorageApi;
  sessionId?: string;
  onMeditationUpdate: (updatedMeditation: Meditation) => void;
  synthesisState: SynthesisState;
  onSynthesisStateUpdate: (synthesisState: SynthesisState) => void;
}

export function SynthesisProgressStep({
  meditation,
  voiceSettings,
  onCancel,
  onComplete,
  fileStorage,
  sessionId,
  onMeditationUpdate,
  synthesisState,
  onSynthesisStateUpdate,
}: SynthesisProgressProps) {
  // Add state for currently playing section
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);

  const {
    progress,
    error,
    isSynthesizing,
    isGeneratingFullAudio,
    handleCancel,
    startSynthesis,
  } = useSynthesis(
    meditation,
    voiceSettings,
    fileStorage,
    onMeditationUpdate,
    onSynthesisStateUpdate,
    onCancel,
    synthesisState,
    sessionId
  );

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

  // Check if all steps that need audio have audioFileId
  const isAllAudioReady = progress === 100 && !isSynthesizing && !error;

  const { title, steps } = meditation;

  return (
    <div>
      <h1 className="text-3xl font-medium text-center mb-6">{title}</h1>
      <Card className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex justify-end">
          {synthesisState.started && !isSynthesizing && progress < 100 ? (
            <Button
              variant="outline"
              onClick={startSynthesis}
              className="gap-2 mr-2"
            >
              <PlayCircle className="h-4 w-4" />
              Resume Synthesis
            </Button>
          ) : null}
          <Button
            variant="destructive"
            onClick={handleCancel}
            className="gap-2"
            disabled={!isSynthesizing}
          >
            <StopCircle className="h-4 w-4" />
            Cancel Synthesis
          </Button>
        </div>

        <ProgressHeader
          progress={progress}
          title={title}
          isGeneratingFullAudio={isGeneratingFullAudio}
        />

        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
        )}

        <div className="space-y-2">
          {steps.map((section, index) => (
            <MeditationStepDisplay
              key={`${index}-${section.audioFileId || "pending"}`}
              section={section}
              status={getStepStatus(section, currentlyPlaying, index)}
              onPreview={
                section.audioFileId && section.type === "speech"
                  ? () => previewSection(index)
                  : undefined
              }
            />
          ))}
        </div>

        <div className="text-sm text-muted-foreground text-center">
          {progress < 90
            ? ""
            : progress < 100
            ? "Generating full audio file..."
            : "Synthesis complete!"}
        </div>

        {isAllAudioReady && (
          <div className="pt-6 flex justify-center">
            <Button className="gap-2" size="lg" onClick={onComplete}>
              <PlayCircle className="h-5 w-5" />
              Play Meditation
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
