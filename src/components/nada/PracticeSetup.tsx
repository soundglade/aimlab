import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  MeditationFormatterResult,
  FormattedScript,
} from "@/lib/meditation-formatter";
import { Meditation } from "./NadaPage";

interface PracticeSetupProps {
  onScriptCreated: (script: FormattedScript) => void;
  isPrivate: boolean;
  onPrivateChange: (isPrivate: boolean) => void;
  onLoadSession?: (sessionId: string) => void;
  savedSessions: Record<string, { meditation: Meditation }> | null;
}

export function PracticeSetup({
  onScriptCreated,
  isPrivate,
  onPrivateChange,
  onLoadSession,
  savedSessions,
}: PracticeSetupProps) {
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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

      // Success case - pass just the script to the parent
      onScriptCreated(formattedResult.script);
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

  const handleLoadSession = (sessionId: string) => {
    if (onLoadSession) {
      onLoadSession(sessionId);
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
        {!isPrivate &&
          savedSessions &&
          Object.keys(savedSessions).length > 0 && (
            <div className="bg-muted/20 p-4 rounded-md border border-muted/40">
              <p className="text-sm font-medium mb-3">
                Your saved meditations:
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {Object.entries(savedSessions).map(([id, data]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleLoadSession(id)}
                    className="inline-flex items-center text-sm text-primary hover:text-primary/80 hover:underline"
                  >
                    <span className="font-medium">{data.meditation.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        <Textarea
          placeholder="Paste your meditation script here or select a saved meditation above..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="h-64 bg-white/50"
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Read Script"}
        </Button>
      </form>
    </>
  );
}
