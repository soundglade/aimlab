import { MeditationStep } from "./MeditationStep";
import { Meditation } from "../Rila";
import { useAtom, useAtomValue } from "jotai";
import {
  meditationAtom,
  editableTextsAtom,
  editablePauseDurationsAtom,
  editingStepIndexAtom,
  selectedStepIndexAtom,
  isUILockedAtom,
} from "../MeditationWorkspace";

interface MeditationStepsListProps {
  onStartEditing: (index: number) => void;
  onTextChange: (index: number, text: string) => void;
  onPauseDurationChange: (index: number, duration: number) => void;
  onBlur: (index: number) => void;
  onPreviewSection: (index: number) => void;
  onGenerateStepAudio: (index: number) => void;
  onSelectStep: (index: number) => void;
  onContainerClick: (e: React.MouseEvent) => void;
  isStepOutOfSync: (index: number) => boolean;
}

export function MeditationStepsList({
  onStartEditing,
  onTextChange,
  onPauseDurationChange,
  onBlur,
  onPreviewSection,
  onGenerateStepAudio,
  onSelectStep,
  onContainerClick,
  isStepOutOfSync,
}: MeditationStepsListProps) {
  // Use atoms instead of props
  const meditation = useAtomValue(meditationAtom);

  // If meditation is null, don't render anything
  if (!meditation) return null;

  return (
    <div
      className="mx-auto max-w-3xl px-4 space-y-4 py-4"
      onClick={onContainerClick}
    >
      {meditation.steps.map((step, index) => {
        const isAudioGenerated = !!step.audioFileId;
        const isOutOfSync = isStepOutOfSync(index);

        return (
          <MeditationStep
            key={index}
            step={step}
            index={index}
            onEdit={() => onStartEditing(index)}
            onTextChange={(text) => onTextChange(index, text)}
            onPauseDurationChange={(duration) =>
              onPauseDurationChange(index, duration)
            }
            onBlur={() => onBlur(index)}
            onPreview={
              step.audioFileId ? () => onPreviewSection(index) : undefined
            }
            isAudioGenerated={isAudioGenerated}
            isAudioOutOfSync={isOutOfSync}
            onGenerateAudio={() => onGenerateStepAudio(index)}
            onSelect={() => onSelectStep(index)}
          />
        );
      })}
    </div>
  );
}
