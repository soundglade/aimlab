import React from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Undo, Check, Edit } from "lucide-react";
import { Clock } from "lucide-react";
import { stepAtom, structuredMeditationAtom } from "../atoms";

interface ReviewScreenProps {
  onStartSynthesis: () => void;
}

const ReviewScreen = ({ onStartSynthesis }: ReviewScreenProps) => {
  const [, setStep] = useAtom(stepAtom);
  const [structuredMeditation] = useAtom(structuredMeditationAtom);

  const handleEdit = () => {
    setStep(1);
  };

  const handleContinue = () => {
    onStartSynthesis();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl tracking-tight">Review Your Meditation</h2>
        <p className="text-muted-foreground">
          We've structured your meditation script. Review it to make sure it
          looks good.
        </p>
      </div>

      <div className="text-muted-foreground max-h-[400px] overflow-y-auto rounded-md border p-4">
        <h1 className="text-foreground text-xl">
          {structuredMeditation?.title || "Micro Meditation"}
        </h1>

        {structuredMeditation?.steps.map((item, index) => {
          if (item.type === "heading") {
            return (
              <h2 key={index} className="text-foreground mt-6 text-lg">
                {item.text}
              </h2>
            );
          } else if (item.type === "speech") {
            return (
              <p key={index} className="my-3">
                {item.text}
              </p>
            );
          } else if (item.type === "pause") {
            return (
              <div
                key={index}
                className="bg-muted my-3 inline-flex items-center rounded-md px-3 py-2"
              >
                <Clock className="mr-2 h-4 w-4" /> Pause: {item.duration}{" "}
                seconds
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="flex space-x-4 pt-4">
        <Button variant="outline" className="flex-1" onClick={handleEdit}>
          <Undo className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button className="flex-1" onClick={handleContinue}>
          <Check className="mr-2 h-4 w-4" /> Confirm & Create
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;
