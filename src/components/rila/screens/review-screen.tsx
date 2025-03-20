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
        <h2 className="text-2xl font-bold">Review Your Meditation</h2>
        <p className="text-muted-foreground">
          We've structured your meditation script. Review it to make sure it
          looks good.
        </p>
      </div>

      <div className="space-y-6 bg-card border rounded-md p-4 max-h-[400px] overflow-y-auto">
        <h1 className="text-2xl font-bold">
          # {structuredMeditation?.title || "Micro Meditation"}
        </h1>

        {structuredMeditation?.steps.map((item, index) => {
          if (item.type === "heading") {
            return (
              <h2 key={index} className="mt-6 text-xl font-semibold">
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
                className="inline-flex items-center px-3 py-2 my-3 bg-muted text-primary rounded-md"
              >
                <Clock className="w-4 h-4 mr-2" /> Pause: {item.duration}{" "}
                seconds
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="flex pt-4 space-x-4">
        <Button variant="outline" className="flex-1" onClick={handleEdit}>
          <Undo className="w-4 h-4 mr-2" /> Edit
        </Button>
        <Button className="flex-1" onClick={handleContinue}>
          <Check className="w-4 h-4 mr-2" /> Confirm & Create
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;
