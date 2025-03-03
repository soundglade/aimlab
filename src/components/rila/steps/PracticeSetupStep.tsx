import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FormattedScript } from "@/lib/meditation-formatter";
import { Meditation } from "../Rila";

interface PracticeSetupProps {
  onScriptCreated: (script: FormattedScript) => void;
  isPrivate: boolean;
  onPrivateChange: (isPrivate: boolean) => void;
  onLoadSession?: (sessionId: string) => void;
  savedSessions: Record<string, { meditation: Meditation }> | null;
}

export function PracticeSetupStep({
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
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Create Your Guided Meditation
        </h1>

        <div className="space-y-4">
          <p className="text-xl text-muted-foreground">
            How would you like to practice?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "Save Practice", value: false },
              { label: "Private Session", value: true },
            ].map((option) => (
              <Button
                key={option.label}
                type="button"
                onClick={() => onPrivateChange(option.value)}
                variant={isPrivate === option.value ? "outline" : "ghost"}
                size="lg"
                className="rounded-full md:min-w-32"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {isPrivate
              ? "Your practice remains yours alone and is not saved"
              : "Keep the option to save your meditation for future sessions"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isPrivate &&
          savedSessions &&
          Object.keys(savedSessions).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Your saved meditations:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(savedSessions).map(([id, data], index) => (
                    <Button
                      key={id}
                      type="button"
                      onClick={() => handleLoadSession(id)}
                      variant="outline"
                      className="justify-start h-auto py-2 px-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2 text-left overflow-hidden">
                        <Badge
                          variant="secondary"
                          className="h-6 min-w-6 flex items-center justify-center rounded-full text-xs shrink-0"
                        >
                          {index + 1}
                        </Badge>
                        <span className="truncate">
                          {data.meditation.title}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        <Card>
          <CardContent>
            <Textarea
              placeholder="Paste your meditation script here or select a saved meditation above..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="h-64 resize-none border-0 focus-visible:ring-0 px-4 py-3 shadow-none"
            />
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            className="px-10 py-6 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Read Script"}
          </Button>
        </div>
      </form>
    </div>
  );
}
