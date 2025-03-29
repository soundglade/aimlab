import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDescription, Alert } from "@/components/ui/alert";
import { ArrowRight, Info } from "lucide-react";
import {
  meditationScriptAtom,
  stepAtom,
  structuredMeditationAtom,
  editableMarkdownAtom,
} from "../atoms";
import VoiceSelection from "../voice-selection";
import type { Meditation } from "../../types";

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
    <div className="space-y-5">
      <div className="mb-8 space-y-2">
        <h2 className="text-2xl tracking-tight">Script and Voice</h2>
        <p className="text-muted-foreground">
          Paste your AI-generated meditation script below and choose a voice for
          your guided meditation.
        </p>
      </div>

      <div>
        <label className="mb-2 block">Meditation Script</label>
        <Textarea
          placeholder="Paste your meditation script here..."
          className="max-h-[300px] min-h-[200px] overflow-y-auto"
          value={meditationScript}
          onChange={(e) => setMeditationScript(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <p className="text-muted-foreground -mt-2 mb-8 flex items-center gap-1 text-sm">
        <Info className="mr-1 h-3 w-3" />
        All meditations are public. Please avoid including personal or sensitive
        information.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <VoiceSelection isDisabled={isLoading} />

      <div className="pt-4">
        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={isLoading || !meditationScript.trim()}
        >
          Continue to Review
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default InputScreen;
