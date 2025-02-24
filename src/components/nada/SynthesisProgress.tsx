import { useState, useEffect, useRef } from "react";
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
  voiceSettings: {
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  };
  onCancel: () => void;
}

export function SynthesisProgress({
  script,
  voiceSettings,
  onCancel,
}: SynthesisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [audioSections] = useState(new Map<number, Blob>());
  const [error, setError] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let aborted = false;

    async function startSynthesis() {
      try {
        setIsSynthesizing(true);
        setError(null);

        const response = await fetch("/api/synthesize-meditation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sections: script.formattedScript,
            voiceSettings,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Synthesis request failed");
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!aborted) {
          const { done, value } = await reader.read();

          if (done) break;

          // Append new data to buffer and process complete messages
          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n");

          // Keep the last incomplete message in buffer
          buffer = messages.pop() || "";

          // Process complete messages
          for (const message of messages) {
            if (!message) continue;

            const data = JSON.parse(message);

            switch (data.type) {
              case "progress":
                setProgress(data.progress);
                setCurrentIndex(data.sectionIndex);
                break;

              case "audio":
                const audioBlob = await fetch(
                  `data:audio/wav;base64,${data.data}`
                ).then((r) => r.blob());
                audioSections.set(data.sectionIndex, audioBlob);
                break;

              case "complete":
                setProgress(100);
                break;

              case "error":
                throw new Error(data.message);
            }
          }
        }
      } catch (err) {
        if (!aborted) {
          // Don't show the abort error to the user
          if (err instanceof Error && err.name === "AbortError") {
            setError("Synthesis cancelled");
          } else {
            setError(err instanceof Error ? err.message : "Synthesis failed");
          }
        }
      } finally {
        if (!aborted) {
          setIsSynthesizing(false);
        }
      }
    }

    startSynthesis();

    return () => {
      aborted = true;
      abortController.abort();
    };
  }, [script.formattedScript, voiceSettings]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsSynthesizing(false);
    }
    onCancel();
  };

  const previewSection = async (index: number) => {
    const audioBlob = audioSections.get(index);
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);

    audio.onended = () => {
      URL.revokeObjectURL(url);
    };

    await audio.play();
  };

  const getScriptSectionStatus = (index: number) => {
    if (audioSections.has(index)) return "complete";
    if (index === currentIndex) return "processing";
    return "pending";
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
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="text-red-600 gap-2"
          disabled={!isSynthesizing}
        >
          <StopCircle className="h-4 w-4" />
          Cancel Synthesis
        </Button>
      </div>

      <ProgressHeader progress={progress} />

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
      )}

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

      <div className="text-sm text-muted-foreground text-center">
        {progress < 100
          ? "Estimated time remaining: ~2 minutes"
          : "Synthesis complete!"}
      </div>
    </Card>
  );
}
