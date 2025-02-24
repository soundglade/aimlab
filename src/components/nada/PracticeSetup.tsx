import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MeditationFormatterResult } from "@/lib/meditation-formatter";

interface PracticeSetupProps {
  onScriptFormatted: (
    formattedScript: MeditationFormatterResult,
    isPrivate: boolean
  ) => void;
  isPrivate: boolean;
  onPrivateChange: (isPrivate: boolean) => void;
}

export function PracticeSetup({
  onScriptFormatted,
  isPrivate,
  onPrivateChange,
}: PracticeSetupProps) {
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/format-meditation-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script,
          mode: isPrivate ? "private" : "standard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to format script");
      }

      const formattedScript = await response.json();
      onScriptFormatted(formattedScript, isPrivate);
    } catch (error) {
      console.error("Error formatting script:", error);
      // TODO: Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-4xl text-foreground text-center">
        Create Your Guided Meditation
      </h1>

      <div className="space-y-2 text-center">
        <p className="text-xl text-muted-foreground">
          How would you like to practice?
        </p>
        <div className="flex justify-center gap-4">
          {[
            { label: "Save Practice", value: false },
            { label: "Private Session", value: true },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onPrivateChange(option.value)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                isPrivate === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {isPrivate
            ? "Your practice remains yours alone and is not saved"
            : "Keep the option to save your meditation for future sessions"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Textarea
          placeholder="Paste your meditation script here..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="h-64 bg-white/50"
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Read Script"}
        </Button>
      </form>
    </>
  );
}
