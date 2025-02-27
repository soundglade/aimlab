import { useState, useEffect, useRef, useCallback } from "react";
import { Meditation } from "./NadaPage";
import { FileStorageApi } from "@/lib/file-storage";
import * as synthesisService from "./synthesisService";
import * as meditationTimeline from "./meditationTimeline";
import { Buffer } from "buffer";

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

  // We only need refs for values that we need to access in callbacks
  // that might be stale due to closures
  const meditationRef = useRef(meditation);

  // Refs for synthesis control
  const synthesisRef = useRef<{ abort: () => void } | null>(null);
  const synthesisStartedRef = useRef<boolean>(false);

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
      ...meditation,
      steps: meditation.steps.map((step) => ({
        ...step,
        audioFileId: undefined,
        durationMs: undefined,
      })),
    };
    onMeditationUpdate(updatedMeditation);

    // Use the service
    synthesisRef.current = synthesisService.startSynthesis(
      {
        meditation: updatedMeditation,
        voiceSettings,
        fileStorage,
        sessionId,
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

          // Add duration information when we have the audio file
          if (fileId && !fileId.startsWith("error-")) {
            // Get the audio duration from the file
            fileStorage
              .getFile(fileId)
              .then(async (storedFile) => {
                if (storedFile && storedFile.data) {
                  try {
                    // Use the function from synthesisService
                    const durationMs = await synthesisService.getAudioDuration(
                      storedFile
                    );

                    // Update the step with duration information
                    const updatedMeditation = JSON.parse(
                      JSON.stringify(meditationRef.current)
                    );
                    updatedMeditation.steps[sectionIndex].durationMs =
                      durationMs;

                    // Update the meditation with duration info
                    onMeditationUpdate(updatedMeditation);
                  } catch (err) {
                    console.error("Error getting audio duration:", err);
                  }
                }
              })
              .catch((err) => {
                console.error("Error getting audio file:", err);
              });
          }

          // Update the meditation
          onMeditationUpdate(newMeditation);
        },
        onComplete: () => {
          // Get the current meditation with all audio files
          const currentMeditation = meditationRef.current;

          // Add timeline to the meditation
          const meditationWithTimeline =
            meditationTimeline.addTimelineToMeditation(
              currentMeditation,
              3000 // 3 second default gap
            );

          // Update the meditation with timeline
          onMeditationUpdate(meditationWithTimeline);

          // Update state
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
  }, []); // Empty dependency array since we're using refs for changing values

  return {
    progress,
    error,
    isSynthesizing,
    handleCancel,
  };
}
