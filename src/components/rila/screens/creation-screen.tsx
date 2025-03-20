import React from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Check, AlertCircle } from "lucide-react";
import { progressAtom, isCompletedAtom } from "../atoms";

interface CreationScreenProps {
  onPlayMeditation: () => void;
  error: string | null;
}

const CreationScreen = ({ onPlayMeditation, error }: CreationScreenProps) => {
  const [progress] = useAtom(progressAtom);
  const [isCompleted] = useAtom(isCompletedAtom);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          {error
            ? "Meditation Creation Failed"
            : isCompleted
            ? "Meditation Created"
            : "Creating Your Meditation"}
        </h2>
        <p className="text-muted-foreground">
          {error
            ? "There was an error creating your meditation."
            : isCompleted
            ? "Your meditation has been successfully generated."
            : "We're generating your meditation. This may take a minute or two."}
        </p>
      </div>

      {!isCompleted && !error && (
        <>
          <Progress value={progress} className="w-full max-w-md" />
          <p className="text-muted-foreground">Generating audio segments...</p>
        </>
      )}

      <div
        className={`bg-muted rounded-md p-6 max-w-md ${
          isCompleted ? "border border-primary/30" : ""
        } ${error ? "border border-destructive/30" : ""}`}
      >
        {error ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/20">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <p className="mb-4 text-destructive">{error}</p>
            <p className="mb-4 text-muted-foreground">
              Please try again or contact support if the issue persists.
            </p>
          </>
        ) : !isCompleted ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
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
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                <Check className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="mb-4 text-primary">
              Your meditation is ready to play! Experience it now.
            </p>
            <Button className="w-full" onClick={onPlayMeditation}>
              <Play className="w-4 h-4 mr-2" /> Play Meditation
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreationScreen;
