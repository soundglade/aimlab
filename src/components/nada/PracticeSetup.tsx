import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { initializeStorage } from "@/lib/session-storage";
import type {
  MeditationFormatterResult,
  FormattedScript,
} from "@/lib/meditation-formatter";

// Initialize the storage for accessing saved sessions
const storage = initializeStorage("nada");

interface SavedSession {
  id: string;
  title: string;
  createdAt: number;
}

interface PracticeSetupProps {
  onScriptFormatted: (
    formattedResult: MeditationFormatterResult,
    isPrivate: boolean
  ) => void;
  isPrivate: boolean;
  onPrivateChange: (isPrivate: boolean) => void;
  onLoadSession?: (sessionId: string) => void;
}

export function PracticeSetup({
  onScriptFormatted,
  isPrivate,
  onPrivateChange,
  onLoadSession,
}: PracticeSetupProps) {
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Load saved sessions on component mount
  useEffect(() => {
    const sessions = storage.getAllSessions();
    if (sessions) {
      const formattedSessions: SavedSession[] = Object.entries(sessions)
        .map(([id, data]) => {
          const sessionData = data as {
            script: FormattedScript;
            createdAt: number;
          };
          return {
            id,
            title: sessionData.script?.title || "Untitled Meditation",
            createdAt: sessionData.createdAt || Date.now(),
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt); // Sort by most recent first

      setSavedSessions(formattedSessions);
    }
  }, []);

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

      // Success case - proceed to next step
      onScriptFormatted(formattedResult, isPrivate);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        {!isPrivate && savedSessions.length > 0 && (
          <div className="bg-muted/20 p-4 rounded-md border border-muted/40">
            <p className="text-sm font-medium mb-3">Your saved meditations:</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {savedSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleLoadSession(session.id)}
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 hover:underline"
                >
                  <span className="font-medium">{session.title}</span>
                  <span className="text-muted-foreground text-xs ml-1.5">
                    ({formatDate(session.createdAt)})
                  </span>
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
