import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, StopCircle } from "lucide-react";
import { Meditation, SynthesisState } from "../Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { VoiceSettings } from "./voice/ttsTypes";
import { useSynthesis } from "./synthesis/useSynthesis";
import {
  MeditationStepDisplay,
  getStepStatus,
  useAudioPreview,
} from "./synthesis/MeditationStepDisplay";

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
  // Use the audio preview hook
  const { currentlyPlaying, previewSection } = useAudioPreview(
    meditation,
    fileStorage
  );

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
