import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Meditation } from "../Rila";
import { useState, useEffect } from "react";

// Using more consistent spacing from Tailwind's scale
const getHeadingMargin = (index: number, level: number) => {
  if (index === 0) return "";
  switch (level) {
    case 1:
      return "mt-12"; // Large spacing for major sections
    case 2:
      return "mt-8"; // Medium spacing for sub-sections (changed from mt-9)
    case 3:
      return "mt-4"; // Smaller spacing (changed from mt-3 to use Tailwind scale)
    default:
      return "";
  }
};

const getHeadingStyle = (level: number) => {
  switch (level) {
    case 2:
      return "text-xl font-medium leading-relaxed p-3";
    case 3:
      return "text-md font-medium leading-relaxed p-3";
    default:
      return "";
  }
};

interface FormatReviewStepProps {
  meditation: Meditation;
  onMeditationUpdate: (updatedMeditation: Meditation) => void;
  onConfirm: () => void;
}

export function FormatReviewStep({
  meditation,
  onMeditationUpdate,
  onConfirm,
}: FormatReviewStepProps) {
  const { title, steps } = meditation;

  // Local state for editable text
  const [editableTexts, setEditableTexts] = useState<{ [key: number]: string }>(
    steps.reduce((acc, step, index) => {
      if (step.type === "speech" || step.type === "heading") {
        acc[index] = step.text;
      }
      return acc;
    }, {} as { [key: number]: string })
  );

  // Update local state when meditation prop changes
  useEffect(() => {
    setEditableTexts(
      steps.reduce((acc, step, index) => {
        if (step.type === "speech" || step.type === "heading") {
          acc[index] = step.text;
        }
        return acc;
      }, {} as { [key: number]: string })
    );
  }, [steps]);

  // Handle text change in the input
  const handleTextChange = (index: number, text: string) => {
    setEditableTexts((prev) => ({
      ...prev,
      [index]: text,
    }));
  };

  // Update meditation when input loses focus
  const handleBlur = (index: number) => {
    const updatedSteps = [...steps];
    if (
      updatedSteps[index].type === "speech" ||
      updatedSteps[index].type === "heading"
    ) {
      updatedSteps[index] = {
        ...updatedSteps[index],
        text: editableTexts[index],
      };

      onMeditationUpdate({
        ...meditation,
        steps: updatedSteps,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-medium text-center mb-10">{title}</h1>
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const margin =
              step.type === "heading"
                ? getHeadingMargin(index, step.level || 1)
                : "";

            return (
              <div key={index} className={margin}>
                {step.type === "heading" && step.level !== 1 && (
                  <div className={getHeadingStyle(step.level || 2)}>
                    <Input
                      value={editableTexts[index] || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      onBlur={() => handleBlur(index)}
                      className="w-full border-none shadow-none focus-visible:ring-0 h-auto p-0"
                    />
                  </div>
                )}

                {step.type === "speech" && (
                  <Card className="p-3 rounded-sm border shadow-none bg-card/50">
                    <Textarea
                      value={editableTexts[index] || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      onBlur={() => handleBlur(index)}
                      className="w-full border-none shadow-none focus-visible:ring-0 resize-none min-h-[24px] p-0"
                      rows={Math.max(
                        1,
                        (editableTexts[index] || "").split("\n").length
                      )}
                    />
                  </Card>
                )}

                {step.type === "pause" && (
                  <div className="text-muted-foreground p-3">
                    {step.duration}s pause
                    {step.canExtend && " (can be extended)"}
                    {step.waitForUserInput && " (waiting for user)"}
                  </div>
                )}

                {step.type === "sound" && (
                  <div className="text-muted-foreground">
                    {step.soundId}
                    {step.description && (
                      <span className="text-sm ml-2">({step.description})</span>
                    )}
                  </div>
                )}

                {step.type === "aside" && (
                  <div className="italic text-muted-foreground">
                    {step.text}
                  </div>
                )}

                {step.type === "direction" && (
                  <div className="text-primary">{step.text}</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-center pt-2 md:pt-4">
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </div>
  );
}
