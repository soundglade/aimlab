import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, StopCircle } from "lucide-react";
import type { MeditationFormatterResult } from "@/lib/meditation-formatter";
import { cn } from "@/lib/utils";

// Internal components
function ProgressHeader({ progress }: { progress: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Synthesizing Audio</h2>
          <p className="text-muted-foreground">
            {progress < 100
              ? "Creating your meditation audio..."
              : "Synthesis complete!"}
          </p>
        </div>
        <div className="text-lg font-medium">{Math.round(progress)}%</div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

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

interface ScriptSectionProps {
  section: NonNullable<MeditationFormatterResult["formattedScript"]>[number];
  status: "pending" | "processing" | "complete";
  onPreview?: () => void;
}

function ScriptSection({ section, status, onPreview }: ScriptSectionProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "complete":
        return "bg-green-50 border-green-200";
      case "processing":
        return "bg-blue-50 border-blue-200 animate-pulse";
      default:
        return "bg-white/50";
    }
  };

  if (section.type === "heading") {
    return (
      <div className={cn("font-medium", getHeadingSize(section.level))}>
        {section.text}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "p-3 rounded-sm border shadow-none flex justify-between items-start",
        getStatusStyles(),
        section.type === "aside" && "italic",
        section.type === "direction" && "text-primary"
      )}
    >
      <div className="flex-1">
        {section.type === "speech" && <div>{section.text}</div>}
        {section.type === "pause" && (
          <div className="text-muted-foreground">
            {section.duration}s pause
            {section.canExtend && " (can be extended)"}
            {section.waitForUserInput && " (waiting for user)"}
          </div>
        )}
        {section.type === "sound" && (
          <div className="text-muted-foreground">
            {section.soundId}
            {section.description && (
              <span className="text-sm ml-2">({section.description})</span>
            )}
          </div>
        )}
        {section.type === "aside" && (
          <div className="text-muted-foreground">{section.text}</div>
        )}
        {section.type === "direction" && <div>{section.text}</div>}
      </div>
      {status === "complete" && onPreview && section.type === "speech" && (
        <Button variant="ghost" size="sm" className="ml-2" onClick={onPreview}>
          <Play className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}

interface SynthesisProgressProps {
  script: MeditationFormatterResult;
  onCancel: () => void;
}

export function SynthesisProgress({
  script,
  onCancel,
}: SynthesisProgressProps) {
  // Mock state for the demo
  const [progress, setProgress] = useState(35);
  const [currentIndex, setCurrentIndex] = useState(2);

  const getScriptSectionStatus = (index: number) => {
    if (index < currentIndex) return "complete";
    if (index === currentIndex) return "processing";
    return "pending";
  };

  const previewSection = (index: number) => {
    console.log("Preview section", index);
    // TODO: Implement audio preview
  };

  if (!script.formattedScript) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground">No script content available</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <ProgressHeader progress={progress} />

      <div className="space-y-2">
        {script.formattedScript.map((section, index) => (
          <ScriptSection
            key={index}
            section={section}
            status={getScriptSectionStatus(index)}
            onPreview={
              getScriptSectionStatus(index) === "complete" &&
              section.type === "speech"
                ? () => previewSection(index)
                : undefined
            }
          />
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-red-600 gap-2"
        >
          <StopCircle className="h-4 w-4" />
          Cancel Synthesis
        </Button>
        <div className="text-sm text-muted-foreground">
          Estimated time remaining: ~2 minutes
        </div>
      </div>
    </Card>
  );
}
