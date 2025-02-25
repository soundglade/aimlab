import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FormattedScript } from "@/lib/meditation-formatter";
import { cn } from "@/lib/utils";

const getHeadingMargin = (index: number, level: number) => {
  if (index === 0) return "";
  switch (level) {
    case 1:
      return "mt-12";
    case 2:
      return "mt-9";
    case 3:
      return "mt-3";
    default:
      return "";
  }
};

const getHeadingSize = (level: number) => {
  switch (level) {
    case 1:
      return "text-3xl leading-relaxed";
    case 2:
      return "text-xl leading-relaxed";
    case 3:
      return "text-md leading-relaxed";
    default:
      return "";
  }
};

interface FormattedMeditationProps {
  script: FormattedScript;
  onConfirm: () => void;
}

export function FormattedMeditation({
  script,
  onConfirm,
}: FormattedMeditationProps) {
  const { title, steps } = script;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-medium text-center">{title}</h1>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const margin =
            step.type === "heading" ? getHeadingMargin(index, step.level) : "";

          return (
            <div key={index} className={margin}>
              {step.type === "heading" && (
                <div className={cn("font-medium", getHeadingSize(step.level))}>
                  {step.text}
                </div>
              )}

              {step.type === "speech" && (
                <Card className="p-3 rounded-sm border shadow-none bg-white/50">
                  <div>{step.text}</div>
                </Card>
              )}

              {step.type === "pause" && (
                <div className="text-muted-foreground">
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

      <div className="flex justify-center pt-4">
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </div>
  );
}
