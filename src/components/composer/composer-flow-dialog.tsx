import React, { useState } from "react";
import { useAtom } from "jotai";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Import screen components
import InputScreen from "./screens/input-screen";
import ReviewScreen from "./screens/review-screen";
import CreationScreen from "./screens/creation-screen";

// Import atoms
import {
  stepAtom,
  meditationScriptAtom,
  structuredMeditationAtom,
  editableMarkdownAtom,
  progressAtom,
  isCompletedAtom,
  meditationUrlAtom,
  voiceIdAtom,
  resetAtoms,
} from "./atoms";

import { useMyMeditations } from "@/components/utils/use-my-meditations";

interface ComposerFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComposerFlowDialog = ({
  open,
  onOpenChange,
}: ComposerFlowDialogProps) => {
  // Get atoms
  const [step, setStep] = useAtom(stepAtom);
  const [, setMeditationScript] = useAtom(meditationScriptAtom);
  const [structuredMeditation, setStructuredMeditation] = useAtom(
    structuredMeditationAtom
  );
  const [, setEditableMarkdown] = useAtom(editableMarkdownAtom);
  const [, setProgress] = useAtom(progressAtom);
  const [, setIsCompleted] = useAtom(isCompletedAtom);
  const [meditationUrl, setMeditationUrl] = useAtom(meditationUrlAtom);
  const [error, setError] = useState<string | null>(null);
  const [voiceId] = useAtom(voiceIdAtom);
  const { addMeditation } = useMyMeditations();

  // Reset state when dialog is closed
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset all state variables when dialog is closed
      setTimeout(() => {
        resetAtoms();
      }, 300); // Small delay to ensure dialog is closed before resetting state
    }
    onOpenChange(newOpen);
  };

  // Handle starting the meditation synthesis process
  const handleStartSynthesis = async () => {
    // Move to creation screen
    setStep(3);

    // Reset states
    setProgress(0);
    setIsCompleted(false);
    setMeditationUrl(null);
    setError(null);

    if (!structuredMeditation) {
      setError("No meditation data available");
      return;
    }

    try {
      // Call the API to synthesize the meditation
      const response = await fetch("/api/synthesize-meditation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          structuredMeditation,
          voiceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Set up a reader for the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      // Process the stream
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines in the buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const event = JSON.parse(line);

            // Handle different event types
            if (event.type === "progress") {
              setProgress(event.progress);
            } else if (event.type === "complete") {
              if (event.success) {
                setProgress(100);
                setIsCompleted(true);

                // Store the URL and updated meditation data
                if (event.url) {
                  setMeditationUrl(event.url);

                  // Save meditation to localStorage if we have all required data
                  if (
                    event.meditationId &&
                    event.ownerKey &&
                    event.meditation
                  ) {
                    addMeditation({
                      id: event.meditationId,
                      title: event.meditation.title,
                      url: event.url,
                      ownerKey: event.ownerKey,
                    });
                  }
                }

                if (event.meditation) {
                  setStructuredMeditation(event.meditation);
                }
              } else {
                setError(event.error || "Synthesis failed");
              }
            }
          } catch (e) {
            console.error("Failed to parse event:", line, e);
          }
        }
      }
    } catch (err) {
      console.error("Error during meditation synthesis:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  // Handle play meditation action
  const handlePlayMeditation = () => {
    // Navigate to the meditation URL
    if (meditationUrl) {
      window.location.href = meditationUrl;
    } else {
      console.error("No meditation URL available");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        locked={true}
        headerContent={
          <div className="text-muted-foreground inline-flex items-center space-x-2 rounded-full pl-2">
            <span className="text-sm font-medium">Meditation Composer</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    step >= i ? "bg-primary" : "bg-primary/30"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        }
      >
        <div className="p-1">
          {/* Screen components */}
          {step === 1 && <InputScreen />}
          {step === 2 && (
            <ReviewScreen onStartSynthesis={handleStartSynthesis} />
          )}
          {step === 3 && (
            <CreationScreen
              onPlayMeditation={handlePlayMeditation}
              error={error}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComposerFlowDialog;
