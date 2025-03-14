import React from "react";
import { useAtom } from "jotai";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Import screen components
import InputScreen from "./screens/input-screen";
import ReviewScreen from "./screens/review-screen";
import EditScreen from "./screens/edit-screen";
import CreationScreen from "./screens/creation-screen";

// Import atoms
import {
  stepAtom,
  meditationScriptAtom,
  structuredMeditationAtom,
  editableMarkdownAtom,
  progressAtom,
  isCompletedAtom,
} from "./atoms";

// Import types
import { RilaFlowDialogProps } from "./types";

const RilaFlowDialog = ({ open, onOpenChange }: RilaFlowDialogProps) => {
  // Get atoms
  const [step, setStep] = useAtom(stepAtom);
  const [, setMeditationScript] = useAtom(meditationScriptAtom);
  const [, setStructuredMeditation] = useAtom(structuredMeditationAtom);
  const [, setEditableMarkdown] = useAtom(editableMarkdownAtom);
  const [, setProgress] = useAtom(progressAtom);
  const [, setIsCompleted] = useAtom(isCompletedAtom);

  // Reset state when dialog is closed
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset all state variables when dialog is closed
      setTimeout(() => {
        setStep(1);
        setMeditationScript("");
        setStructuredMeditation(null);
        setEditableMarkdown("");
        setProgress(0);
        setIsCompleted(false);
      }, 300); // Small delay to ensure dialog is closed before resetting state
    }
    onOpenChange(newOpen);
  };

  // Handle play meditation action
  const handlePlayMeditation = () => {
    // Close the dialog when user chooses to play the meditation
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[98vh] overflow-y-auto">
        <div className="p-1">
          {/* Progress indicator */}
          <div className="bg-muted text-muted-foreground rounded-full px-4 py-2 inline-flex items-center space-x-2 mb-8">
            <span className="font-medium text-sm">Rila Experiment</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    step >= i ? "bg-primary" : "bg-primary/30"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Screen components */}
          {step === 1 && <InputScreen />}
          {step === 2 && <ReviewScreen />}
          {step === 3 && <EditScreen />}
          {step === 4 && (
            <CreationScreen onPlayMeditation={handlePlayMeditation} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RilaFlowDialog;
