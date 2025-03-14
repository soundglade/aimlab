import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play } from "lucide-react";
import {
  meditationScriptAtom,
  stepAtom,
  structuredMeditationAtom,
  editableMarkdownAtom,
} from "../atoms";
import type { Meditation } from "../types";

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
      setStructuredMeditation(formattedScript);

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
        <div className="flex items-center space-x-2 border p-2 rounded-md bg-card">
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <span>Sarah (Default)</span>
              <div className="text-sm text-primary">
                More voices coming soon
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 w-8 h-8 p-0"
            disabled={isLoading}
          >
            <Play className="h-4 w-4" />
          </Button>
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
