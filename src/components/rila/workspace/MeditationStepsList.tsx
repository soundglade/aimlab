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
  // Props now handled by atoms
  // meditation: Meditation;
  // editableTexts: Record<number, string>;
  // editablePauseDurations: Record<number, number>;
  // editingStepIndex: number | null;
  // selectedStepIndex: number | null;
  // isUILocked: boolean;

  // Props still passed as props
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
  const editableTexts = useAtomValue(editableTextsAtom);
  const editablePauseDurations = useAtomValue(editablePauseDurationsAtom);
  const [editingStepIndex] = useAtom(editingStepIndexAtom);
  const [selectedStepIndex] = useAtom(selectedStepIndexAtom);
  const isUILocked = useAtomValue(isUILockedAtom);

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
            isEditing={editingStepIndex === index}
            isSelected={selectedStepIndex === index}
            editableText={editableTexts[index] || ""}
            editablePauseDuration={editablePauseDurations[index] || 1}
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
            isUILocked={isUILocked}
            onSelect={() => onSelectStep(index)}
          />
        );
      })}
    </div>
  );
}
