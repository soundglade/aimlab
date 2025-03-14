import { useState, useRef, useEffect, useCallback } from "react";
import { Meditation, SynthesisState } from "../../Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { VoiceSettings } from "../voice/ttsTypes";
import * as synthesisService from "../../utils/synthesisService";
import * as meditationTimeline from "../../../rila/utils/meditation-timeline";
import { exportMeditationAudio } from "../../utils/audioExporter";

export function useSynthesis(
  meditation: Meditation,
  voiceSettings: VoiceSettings,
  fileStorage: FileStorageApi,
  onMeditationUpdate: (updatedMeditation: Meditation) => void,
  onSynthesisStateUpdate: (synthesisState: SynthesisState) => void,
  onCancel: () => void,
  synthesisState: SynthesisState,
  sessionId?: string,
  autoStart: boolean = true
) {
  // State management
  const [progress, setProgress] = useState(synthesisState.progress);
  const [error, setError] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGeneratingFullAudio, setIsGeneratingFullAudio] = useState(false);

  // We only need refs for values that we need to access in callbacks
  // that might be stale due to closures
  const meditationRef = useRef(meditation);

  // Refs for synthesis control
  const synthesisRef = useRef<{ abort: () => void } | null>(null);

  // Update meditation ref when it changes
  useEffect(() => {
    meditationRef.current = meditation;
  }, [meditation]);

  // Stable cancel handler
  const handleCancel = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.abort();
      setIsSynthesizing(false);
    }
    onCancel();
  }, [onCancel]);

  // Generate full audio and store it
  const generateAndStoreFullAudio = useCallback(
    async (meditation: Meditation) => {
      try {
        setIsGeneratingFullAudio(true);

        // Generate the full audio
        const audioBlob = (await exportMeditationAudio(
          meditation,
          fileStorage,
          {
            onProgress: (exportProgress) => {
              // Map export progress (0-100) to overall progress (90-100)
              setProgress(90 + exportProgress * 0.1);
            },
            returnBlob: true as any,
          }
        )) as Blob;

        // Store the full audio in file storage
        const fullAudioFileId = await fileStorage.saveFile(audioBlob, {
          projectId: "rila",
          groupId: sessionId,
          contentType: "audio/wav",
        });

        // Update the meditation with the full audio file ID
        const updatedMeditation = {
          ...meditation,
          fullAudioFileId,
        };

        onMeditationUpdate(updatedMeditation);
        setIsGeneratingFullAudio(false);

        return updatedMeditation;
      } catch (error) {
        console.error("Error generating full audio:", error);
        setError(
          `Error generating full audio: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setIsGeneratingFullAudio(false);
        return meditation;
      }
    },
    [fileStorage, onMeditationUpdate, sessionId]
  );

  // At the top of useSynthesis, after other useRef declarations, add:
  const doFinalComplete = useCallback(
    async (currentMeditation: Meditation) => {
      const meditationWithTimeline =
        meditationTimeline.addTimelineToMeditation(currentMeditation);
      onMeditationUpdate(meditationWithTimeline);
      await generateAndStoreFullAudio(meditationWithTimeline);
      setProgress(100);
      setIsSynthesizing(false);
    },
    [generateAndStoreFullAudio, onMeditationUpdate]
  );

  // Start synthesis only if it hasn't been started yet
  const startSynthesis = useCallback(() => {
    if (isSynthesizing) return; // Don't start if already synthesizing

    setIsSynthesizing(true);
    setError(null);

    // Update synthesis state in session
    onSynthesisStateUpdate({
      started: true,
      progress: 0,
      completedStepIndices: synthesisState.completedStepIndices,
    });

    // Use the service
    synthesisRef.current = synthesisService.startSynthesis(
      {
        meditation,
        voiceSettings,
        fileStorage,
        sessionId,
      },
      {
        onProgress: (synthProgress) => {
          // Map synthesis progress (0-100) to overall progress (0-90)
          const newProgress = synthProgress * 0.9;
          setProgress(newProgress);

          // Update synthesis state in session
          onSynthesisStateUpdate({
            started: true,
            progress: newProgress,
            completedStepIndices: synthesisState.completedStepIndices,
          });
        },
        onError: (message) => {
          setError(message);
          setIsSynthesizing(false);
        },
        onAudioCreated: async (sectionIndex, durationMs, fileId) => {
          const currentMeditation = meditationRef.current;
          // Create a deep clone to avoid mutating the current meditation
          const newMeditation = JSON.parse(JSON.stringify(currentMeditation));

          // Set the audio file ID for the specific step
          newMeditation.steps[sectionIndex].audioFileId = fileId;
          newMeditation.steps[sectionIndex].durationMs = durationMs;
          onMeditationUpdate(newMeditation);

          // Update completed steps in synthesis state
          const updatedCompletedSteps = [
            ...synthesisState.completedStepIndices,
            sectionIndex,
          ];
          onSynthesisStateUpdate({
            started: true,
            progress: progress,
            completedStepIndices: updatedCompletedSteps,
          });

          // Check if all speech steps have an audioFileId
          const allSpeechDone = newMeditation.steps
            .filter((step) => step.type === "speech")
            .every((step) => step.audioFileId);
          if (allSpeechDone) {
            await doFinalComplete(newMeditation);
          }
        },
      }
    );

    return () => {
      // This cleanup should only run when the component unmounts
      if (synthesisRef.current) {
        synthesisRef.current.abort();
      }
    };
  }, [
    meditation,
    voiceSettings,
    fileStorage,
    sessionId,
    onMeditationUpdate,
    onSynthesisStateUpdate,
    synthesisState,
    progress,
    isSynthesizing,
    doFinalComplete,
  ]);

  // Start synthesis process when component mounts - only if it hasn't been started yet and autoStart is true
  useEffect(() => {
    if (synthesisState.started || !autoStart) {
      return;
    }

    startSynthesis();
  }, [synthesisState.started, startSynthesis, autoStart]);

  return {
    progress,
    error,
    isSynthesizing,
    isGeneratingFullAudio,
    handleCancel,
    startSynthesis,
  };
}
