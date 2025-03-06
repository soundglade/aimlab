import { MeditationStep } from "./MeditationStep";
import { Meditation, SynthesisState } from "../Rila";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  meditationAtom,
  editableTextsAtom,
  editablePauseDurationsAtom,
  editingStepIndexAtom,
  selectedStepIndexAtom,
  isUILockedAtom,
  isSynthesisCompleteAtom,
  synthesisStateAtom,
} from "../MeditationWorkspace";
import { getAudioBlob } from "../utils/audioUtils";
import { useEffect, useState } from "react";
import * as synthesisService from "../utils/synthesisService";
import { FileStorageApi } from "@/lib/file-storage";

interface MeditationStepsListProps {
  meditation: Meditation;
  fileStorage: any;
  sessionId?: string;
  onMeditationUpdate: (updatedMeditation: Meditation) => void;
  onSynthesisStateUpdate: (synthesisState: SynthesisState) => void;
}

export function MeditationStepsList({
  meditation,
  fileStorage,
  sessionId,
  onMeditationUpdate,
  onSynthesisStateUpdate,
}: MeditationStepsListProps) {
  // Use atoms for state
  const [editableTexts, setEditableTexts] = useAtom(editableTextsAtom);
  const [editablePauseDurations, setEditablePauseDurations] = useAtom(
    editablePauseDurationsAtom
  );
  const [editingStepIndex, setEditingStepIndex] = useAtom(editingStepIndexAtom);
  const [selectedStepIndex, setSelectedStepIndex] = useAtom(
    selectedStepIndexAtom
  );
  const isUILocked = useAtomValue(isUILockedAtom);
  const isSynthesisComplete = useAtomValue(isSynthesisCompleteAtom);
  const synthesisState = useAtomValue(synthesisStateAtom);

  // Audio preview functionality
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

  // Initialize editable texts from meditation steps
  useEffect(() => {
    const texts: Record<number, string> = {};
    const pauseDurations: Record<number, number> = {};

    meditation.steps.forEach((step, index) => {
      if (step.type === "speech" || step.type === "heading") {
        texts[index] = step.text;
      } else if (step.type === "pause") {
        pauseDurations[index] = step.durationMs ? step.durationMs / 1000 : 1;
      }
    });

    setEditableTexts(texts);
    setEditablePauseDurations(pauseDurations);
  }, [meditation, setEditableTexts, setEditablePauseDurations]);

  // Handle text changes and auto-save
  const handleTextChange = (index: number, text: string) => {
    setEditableTexts((prev) => ({ ...prev, [index]: text }));
  };

  // Handle pause duration changes and auto-save
  const handlePauseDurationChange = (index: number, duration: number) => {
    setEditablePauseDurations((prev) => ({ ...prev, [index]: duration }));
  };

  // Save edits for a specific step
  const saveEditForStep = (index: number) => {
    if (isUILocked) return;

    const updatedSteps = [...meditation.steps];
    const step = updatedSteps[index];

    if (step.type === "speech" || step.type === "heading") {
      if (
        editableTexts[index] !== undefined &&
        editableTexts[index] !== step.text
      ) {
        updatedSteps[index] = {
          ...step,
          text: editableTexts[index],
          // Clear audio file ID if text has changed
          audioFileId: undefined,
        };
      }
    } else if (step.type === "pause") {
      if (
        editablePauseDurations[index] !== undefined &&
        editablePauseDurations[index] * 1000 !== step.durationMs
      ) {
        updatedSteps[index] = {
          ...step,
          durationMs: editablePauseDurations[index] * 1000,
        };
      }
    }

    // Only update if changes were made
    if (JSON.stringify(updatedSteps) !== JSON.stringify(meditation.steps)) {
      const updatedMeditation = {
        ...meditation,
        steps: updatedSteps,
        // Clear full audio file ID if any step has changed
        fullAudioFileId: undefined,
        timeline: undefined,
      };

      onMeditationUpdate(updatedMeditation);

      // Reset synthesis state if changes were made
      if (isSynthesisComplete) {
        onSynthesisStateUpdate({
          started: false,
          progress: 0,
          completedStepIndices: [],
        });
      }
    }
  };

  // Auto-save on blur
  const handleTextBlur = (index: number) => {
    saveEditForStep(index);
  };

  // Auto-save pause duration on change
  const handlePauseDurationBlur = (index: number) => {
    saveEditForStep(index);
  };

  // Start editing a step
  const startEditing = (index: number) => {
    if (isUILocked) return;
    setEditingStepIndex(index);
    // Clear selection when editing starts
    setSelectedStepIndex(null);
  };

  // Finish editing and save changes
  const finishEditing = () => {
    setEditingStepIndex(null);
  };

  // Handle click on the container to clear selection
  const handleContainerClick = (e: React.MouseEvent) => {
    // Only clear selection if clicking directly on the container, not on a step
    if (e.target === e.currentTarget) {
      setSelectedStepIndex(null);
    }
  };

  // Track if a step's text has been modified after audio generation
  const isStepOutOfSync = (index: number) => {
    const step = meditation.steps[index];
    if (!step.audioFileId) return false;

    if (step.type === "speech" || step.type === "heading") {
      return editableTexts[index] !== step.text;
    } else if (step.type === "pause") {
      return editablePauseDurations[index] * 1000 !== step.durationMs;
    }

    return false;
  };

  // Generate audio for a specific step
  const handleGenerateStepAudio = async (index: number) => {
    // If the step is out of sync, we need to save the changes first
    if (isStepOutOfSync(index)) {
      saveEditForStep(index);
    }

    const step = meditation.steps[index];

    // Only speech and heading steps can have audio
    if (step.type !== "speech" && step.type !== "heading") {
      return;
    }

    // Set synthesis state to started with only this step as target
    onSynthesisStateUpdate({
      started: true,
      progress: 0,
      completedStepIndices: [],
    });

    try {
      // Call the synthesizeText API with the step text
      const response = await fetch("/api/synthesize-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: step.text,
        }),
      });

      if (!response.ok) {
        throw new Error("Text synthesis failed");
      }

      const result = await response.json();

      // Create a Blob from the base64 audio data
      const audioBlob = getAudioBlob(result.audio, "audio/mp3");

      // Save the audio blob to file storage
      const fileId = await fileStorage.saveFile(audioBlob, {
        projectId: "rila",
        groupId: sessionId,
        contentType: "audio/mp3",
      });

      // Update the meditation with the new audio file ID and duration
      step.audioFileId = fileId;
      step.durationMs = result.durationMs;

      // Update the meditation
      onMeditationUpdate(meditation);

      // Update synthesis state to completed
      onSynthesisStateUpdate({
        started: false,
        progress: 100,
        completedStepIndices: [...synthesisState.completedStepIndices, index],
      });
    } catch (error) {
      console.error("Error generating step audio:", error);

      // Update synthesis state to indicate failure
      onSynthesisStateUpdate({
        started: false,
        progress: 0,
        completedStepIndices: synthesisState.completedStepIndices,
      });
    }
  };

  // Handle step blur
  const handleStepBlur = (index: number) => {
    if (meditation.steps[index].type === "pause") {
      handlePauseDurationBlur(index);
    } else {
      handleTextBlur(index);
    }
    finishEditing();
  };

  return (
    <div
      className="mx-auto max-w-3xl px-4 space-y-4 py-4"
      onClick={handleContainerClick}
    >
      {meditation.steps.map((step, index) => {
        const isAudioGenerated = !!step.audioFileId;
        const isOutOfSync = isStepOutOfSync(index);

        return (
          <MeditationStep
            key={index}
            step={step}
            index={index}
            onEdit={() => startEditing(index)}
            onTextChange={(text) => handleTextChange(index, text)}
            onPauseDurationChange={(duration) =>
              handlePauseDurationChange(index, duration)
            }
            onBlur={() => handleStepBlur(index)}
            onPreview={
              step.audioFileId ? () => previewSection(index) : undefined
            }
            isAudioGenerated={isAudioGenerated}
            isAudioOutOfSync={isOutOfSync}
            onGenerateAudio={() => handleGenerateStepAudio(index)}
            onSelect={() => setSelectedStepIndex(index)}
          />
        );
      })}
    </div>
  );
}
