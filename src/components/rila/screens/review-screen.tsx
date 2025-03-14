import React from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Edit, Check } from "lucide-react";
import { Clock } from "lucide-react";
import { stepAtom, structuredMeditationAtom } from "../atoms";

const ReviewScreen = () => {
  const [, setStep] = useAtom(stepAtom);
  const [structuredMeditation] = useAtom(structuredMeditationAtom);

  const handleEdit = () => {
    setStep(3);
  };

  const handleContinue = () => {
    setStep(4);
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
              <h2 key={index} className="text-xl font-semibold mt-6">
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
                className="bg-muted text-primary rounded-md px-3 py-2 inline-flex items-center my-3"
              >
                <Clock className="h-4 w-4 mr-2" /> Pause: {item.duration}{" "}
                seconds
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="flex space-x-4 pt-4">
        <Button variant="outline" className="flex-1" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" /> Edit Draft
        </Button>
        <Button className="flex-1" onClick={handleContinue}>
          <Check className="h-4 w-4 mr-2" /> Confirm & Create
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;
