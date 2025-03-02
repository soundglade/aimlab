import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Meditation } from "../Rila";

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
  onConfirm: () => void;
}

export function FormatReviewStep({
  meditation,
  onConfirm,
}: FormatReviewStepProps) {
  const { title, steps } = meditation;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-medium text-center mb-10">{title}</h1>

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
                  {step.text}
                </div>
              )}

              {step.type === "speech" && (
                <Card className="p-3 rounded-sm border shadow-none bg-card/50">
                  <div>{step.text}</div>
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
                <div className="italic text-muted-foreground">{step.text}</div>
              )}

              {step.type === "direction" && (
                <div className="text-primary">{step.text}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-2 md:pt-4">
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </div>
  );
}
