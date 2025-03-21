import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Speech, Pause } from "lucide-react";
import useSound from "use-sound";
import {
  meditationScriptAtom,
  stepAtom,
  structuredMeditationAtom,
  editableMarkdownAtom,
} from "../atoms";
import type { Meditation } from "../types";

// Process the meditation script returned from the API
const processMeditationScript = (script: Meditation): Meditation => {
  return {
    ...script,
    steps: script.steps.map((step) => {
      if (step.type === "pause" && step.duration) {
        return {
          ...step,
          durationMs: step.duration * 1000,
        };
      }
      return step;
    }),
  };
};

const InputScreen = () => {
  const [meditationScript, setMeditationScript] = useAtom(meditationScriptAtom);
  const [, setStep] = useAtom(stepAtom);
  const [, setStructuredMeditation] = useAtom(structuredMeditationAtom);
  const [, setEditableMarkdown] = useAtom(editableMarkdownAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [play, { stop }] = useSound("/assets/nicole-kokoro-voice-sample.mp3", {
    onend: () => setIsPlaying(false),
  });

  // Stop audio when component unmounts
  React.useEffect(() => {
    return () => {
      if (isPlaying) {
        stop();
      }
    };
  }, [isPlaying, stop]);

  const handlePlayback = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      play();
      setIsPlaying(true);
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/format-meditation-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: meditationScript,
          mode: "standard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to format script");
      }

      const formattedResult = await response.json();

      // Handle rejection case
      if (formattedResult.isRejected) {
        setError(
          formattedResult.rejectionReason ||
            "The meditation script could not be processed."
        );
        return;
      }

      // Only proceed to next step if we have a valid script
      if (!formattedResult.script) {
        setError("No valid meditation script was generated.");
        return;
      }

      // Success case - store the formatted script
      const formattedScript: Meditation = formattedResult.script;
      const processedScript = processMeditationScript(formattedScript);
      setStructuredMeditation(processedScript);

      // Generate markdown from the formatted script
      const markdown =
        `# ${formattedScript.title}\n\n` +
        formattedScript.steps
          .filter((item) => item.type === "heading")
          .map((heading) => `## ${heading.text}\n`)
          .join("\n") +
        formattedScript.steps
          .filter((item) => item.type !== "heading")
          .map((item) => {
            if (item.type === "speech") {
              return `${item.text}\n`;
            } else if (item.type === "pause") {
              return `PAUSE: ${item.duration} seconds\n`;
            }
            return "";
          })
          .join("\n");

      setEditableMarkdown(markdown);
      setStep(2);
    } catch (error) {
      console.error("Error formatting script:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while processing your script."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Create Your Meditation</h2>
        <p className="text-muted-foreground">
          Paste your AI-generated meditation script below and choose a voice for
          your guided meditation.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          This is an experimental public space. Any meditation you create will
          be visible to others. Please don't include personal or sensitive
          information.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="font-medium">Meditation Script</label>
        <Textarea
          placeholder="Paste your meditation script here..."
          className="min-h-[200px] max-h-[300px] overflow-y-auto"
          value={meditationScript}
          onChange={(e) => setMeditationScript(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium">Voice Selection</label>
        <div className="flex items-center p-2 border space-x-2 rounded-md bg-card">
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 w-8 h-8 p-0"
            disabled={isLoading}
            onClick={handlePlayback}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-primary" />
            ) : (
              <Speech className="w-4 h-4 text-primary" />
            )}
          </Button>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <span>Nicole (Kokoro TTS)</span>
              <div className="hidden text-sm text-muted-foreground md:block">
                More voices coming soon
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={isLoading || !meditationScript.trim()}
        >
          {isLoading ? "Processing..." : "Continue to Review"}
        </Button>
      </div>
    </div>
  );
};

export default InputScreen;
