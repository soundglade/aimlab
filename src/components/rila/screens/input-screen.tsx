import React from "react";
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
import type { FormattedScript } from "@/lib/meditation-formatter";

const InputScreen = () => {
  const [meditationScript, setMeditationScript] = useAtom(meditationScriptAtom);
  const [, setStep] = useAtom(stepAtom);
  const [, setStructuredMeditation] = useAtom(structuredMeditationAtom);
  const [, setEditableMarkdown] = useAtom(editableMarkdownAtom);

  const handleContinue = () => {
    // Sample structured meditation for preview
    const sampleFormattedScript: FormattedScript = {
      title: "Micro Meditation",
      steps: [
        {
          type: "heading",
          text: "Introduction",
        },
        {
          type: "speech",
          text: "Take a deep breath in",
        },
        {
          type: "heading",
          text: "Body",
        },
        {
          type: "speech",
          text: "Exhale smiling",
        },
        {
          type: "pause",
          duration: 5,
        },
        {
          type: "speech",
          text: "Continue to breathe naturally, allowing your thoughts to come and go.",
        },
        {
          type: "pause",
          duration: 10,
        },
        {
          type: "heading",
          text: "Closing",
        },
        {
          type: "speech",
          text: "Slowly bring your awareness back to your surroundings. When you're ready, open your eyes.",
        },
      ],
    };

    setStructuredMeditation(sampleFormattedScript);

    const markdown =
      `# ${sampleFormattedScript.title}\n\n` +
      sampleFormattedScript.steps
        .filter((item) => item.type === "heading")
        .map((heading) => `## ${heading.text}\n`)
        .join("\n") +
      sampleFormattedScript.steps
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

      <div className="space-y-2">
        <label className="font-medium">Meditation Script</label>
        <Textarea
          placeholder="Paste your meditation script here..."
          className="min-h-[200px] max-h-[300px] overflow-y-auto"
          value={meditationScript}
          onChange={(e) => setMeditationScript(e.target.value)}
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
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={!meditationScript.trim()}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
};

export default InputScreen;
