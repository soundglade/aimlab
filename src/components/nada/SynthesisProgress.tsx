import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, StopCircle } from "lucide-react";
import type { MeditationFormatterResult } from "@/lib/meditation-formatter";
import { cn } from "@/lib/utils";

// Internal components
function ProgressHeader({
  progress,
  title,
}: {
  progress: number;
  title: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Synthesizing Audio</h2>
          <p className="text-muted-foreground">
            {progress < 100
              ? `Creating "${title}" meditation audio...`
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
  const [audioSections, setAudioSections] = useState<
    { sectionIndex: number; audioData: string }[]
  >([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Extract title and formattedScript from script
  const { title = "Untitled Meditation", formattedScript = [] } = script;

  useEffect(() => {
    const startSynthesis = async () => {
      try {
        setIsSynthesizing(true);
        setError(null);
        setProgress(0);
        setAudioSections([]);

        // Create a new AbortController for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const response = await fetch("/api/synthesize-meditation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sections: formattedScript,
            voiceSettings,
            title, // Pass the title to the API
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Synthesis request failed");
        }

        // Get the response as a stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get stream reader");
        }

        // Process the stream
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk and add it to our buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete messages in the buffer
          const messages = buffer.split("\n");
          buffer = messages.pop() || ""; // Keep the last incomplete message in the buffer

          for (const message of messages) {
            if (!message.trim()) continue;

            try {
              const data = JSON.parse(message);

              if (data.type === "metadata") {
                // Handle metadata if needed
                // We already have the title from the script, but we could update it if needed
                // This is useful if the API modifies or enhances the title
              } else if (data.type === "progress") {
                setProgress(data.progress);
              } else if (data.type === "audio") {
                setAudioSections((prev) => [
                  ...prev,
                  {
                    sectionIndex: data.sectionIndex,
                    audioData: data.data,
                  },
                ]);
              } else if (data.type === "error") {
                setError(data.message);
              } else if (data.type === "complete") {
                setProgress(100);
              }
            } catch (e) {
              console.error("Error parsing message:", e);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Synthesis aborted");
        } else {
          console.error("Synthesis error:", error);
          setError(
            error instanceof Error ? error.message : "An unknown error occurred"
          );
        }
      } finally {
        setIsSynthesizing(false);
        abortControllerRef.current = null;
      }
    };

    startSynthesis();

    return () => {
      // Cleanup: abort any ongoing request when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [formattedScript, voiceSettings, title]); // Add title to the dependency array

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsSynthesizing(false);
    }
    onCancel();
  };

  const previewSection = async (index: number) => {
    const audioBlob = audioSections.find(
      (section) => section.sectionIndex === index
    )?.audioData;
    if (!audioBlob) return;

    const url = URL.createObjectURL(
      new Blob([Buffer.from(audioBlob, "base64")])
    );
    const audio = new Audio(url);

    audio.onended = () => {
      URL.revokeObjectURL(url);
    };

    await audio.play();
  };

  const getScriptSectionStatus = (index: number) => {
    if (audioSections.some((section) => section.sectionIndex === index))
      return "complete";
    if (index === currentlyPlaying) return "processing";
    return "pending";
  };

  if (!formattedScript) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground">No script content available</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <h1 className="text-2xl font-medium text-center mb-4">{title}</h1>
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

      <ProgressHeader progress={progress} title={title} />

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
      )}

      <div className="space-y-2">
        {formattedScript.map((section, index) => (
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
