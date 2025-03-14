import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Check } from "lucide-react";
import { progressAtom, isCompletedAtom } from "../atoms";

interface CreationScreenProps {
  onPlayMeditation: () => void;
}

const CreationScreen = ({ onPlayMeditation }: CreationScreenProps) => {
  const [progress, setProgress] = useAtom(progressAtom);
  const [isCompleted, setIsCompleted] = useAtom(isCompletedAtom);

  useEffect(() => {
    // Reset progress and completion status when component mounts
    setProgress(0);
    setIsCompleted(false);

    // Start the progress simulation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsCompleted(true);
      }
    }, 500);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [setProgress, setIsCompleted]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          {isCompleted ? "Meditation Created" : "Creating Your Meditation"}
        </h2>
        <p className="text-muted-foreground">
          {isCompleted
            ? "Your meditation has been successfully generated."
            : "We're generating your meditation. This may take a minute or two."}
        </p>
      </div>

      {!isCompleted && (
        <>
          <Progress value={progress} className="w-full max-w-md" />
          <p className="text-muted-foreground">Generating audio segments...</p>
        </>
      )}

      <div
        className={`bg-muted rounded-md p-6 max-w-md ${
          isCompleted ? "border border-primary/30" : ""
        }`}
      >
        {!isCompleted ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/40 animate-pulse"></div>
              </div>
            </div>
            <p className="text-primary">
              Your meditation is being generated with AI voice synthesis.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-primary mb-4">
              Your meditation is ready to play! Experience it now.
            </p>
            <Button className="w-full" onClick={onPlayMeditation}>
              <Play className="h-4 w-4 mr-2" /> Play Meditation
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreationScreen;
