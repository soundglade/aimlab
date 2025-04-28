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
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl tracking-tight">
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
        </>
      )}

      <div
        className={`bg-background rounded-md p-7 max-w-md  ${
          error ? "border border-destructive/30" : ""
        }`}
      >
        {error ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="bg-destructive/20 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertCircle className="text-destructive h-6 w-6" />
              </div>
            </div>
            <p className="text-destructive mb-4">{error}</p>
            <p className="text-muted-foreground mb-4">
              Please try again or contact support if the issue persists.
            </p>
          </>
        ) : !isCompleted ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
                <div className="bg-primary/40 h-8 w-8 animate-pulse rounded-full"></div>
              </div>
            </div>
            <p className="text-primary">Your meditation is being generated.</p>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
                <Check className="text-primary h-6 w-6" />
              </div>
            </div>
            <p className="text-primary mb-4">
              Your meditation is ready to play!
            </p>
            <Button className="w-full" onClick={onPlayMeditation}>
              Play Meditation <Play className="mr-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreationScreen;
