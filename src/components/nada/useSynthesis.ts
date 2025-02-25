import { useState, useEffect, useRef, useCallback } from "react";
import { Meditation } from "./NadaPage";
import { FileStorageApi } from "@/lib/file-storage";
import * as synthesisService from "./synthesisService";

export function useSynthesis(
  meditation: Meditation,
  voiceSettings: synthesisService.VoiceSettings,
  fileStorage: FileStorageApi,
  onMeditationUpdate: (updatedMeditation: Meditation) => void,
  onCancel: () => void,
  sessionId?: string
) {
  // State management
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Refs to hold the latest values without triggering re-renders
  const meditationRef = useRef(meditation);
  const voiceSettingsRef = useRef(voiceSettings);
  const fileStorageRef = useRef(fileStorage);
  const sessionIdRef = useRef(sessionId);
  const onMeditationUpdateRef = useRef(onMeditationUpdate);
  const onCancelRef = useRef(onCancel);

  // Refs for synthesis control
  const synthesisRef = useRef<{ abort: () => void } | null>(null);
  const synthesisStartedRef = useRef<boolean>(false);

  // Update refs when props change
  useEffect(() => {
    meditationRef.current = meditation;
    voiceSettingsRef.current = voiceSettings;
    fileStorageRef.current = fileStorage;
    sessionIdRef.current = sessionId;
    onMeditationUpdateRef.current = onMeditationUpdate;
    onCancelRef.current = onCancel;
  }, [
    meditation,
    voiceSettings,
    fileStorage,
    sessionId,
    onMeditationUpdate,
    onCancel,
  ]);

  // Stable cancel handler that uses the latest ref values
  const handleCancel = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.abort();
      setIsSynthesizing(false);
    }
    onCancelRef.current();
  }, []);

  // Start synthesis process when component mounts - only once
  useEffect(() => {
    if (synthesisStartedRef.current) {
      return;
    }

    synthesisStartedRef.current = true;
    setIsSynthesizing(true);
    setError(null);

    // Reset audioFileId for all steps
    const updatedMeditation = {
      ...meditationRef.current,
      steps: meditationRef.current.steps.map((step) => ({
        ...step,
        audioFileId: undefined,
      })),
    };
    onMeditationUpdateRef.current(updatedMeditation);

    // Use the service
    synthesisRef.current = synthesisService.startSynthesis(
      {
        meditation: updatedMeditation,
        voiceSettings: voiceSettingsRef.current,
        fileStorage: fileStorageRef.current,
        sessionId: sessionIdRef.current,
      },
      {
        onProgress: setProgress,
        onError: (message) => {
          setError(message);
          setIsSynthesizing(false);
        },
        onAudioCreated: (sectionIndex, fileId) => {
          // Use the CURRENT meditation as base
          const currentMeditation = meditationRef.current;

          // Create a deep clone to avoid mutating the current meditation
          const newMeditation = JSON.parse(JSON.stringify(currentMeditation));

          // Set the audio file ID for the specific step
          newMeditation.steps[sectionIndex].audioFileId = fileId;

          // Update the meditation
          onMeditationUpdateRef.current(newMeditation);
        },
        onComplete: () => {
          setProgress(100);
          setIsSynthesizing(false);
        },
      }
    );

    return () => {
      // This cleanup should only run when the component unmounts
      if (synthesisRef.current) {
        synthesisRef.current.abort();
      }
    };
  }, []); // Empty dependency array since we're using refs

  return {
    progress,
    error,
    isSynthesizing,
    handleCancel,
  };
}
