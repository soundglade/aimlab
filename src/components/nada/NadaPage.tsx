"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FormattedMeditation } from "./FormattedMeditation";
import type { MeditationFormatterResult } from "@/lib/meditation-formatter";
import { VoiceSelection } from "./VoiceSelection";
import { initializeStorage } from "@/lib/session-storage";

// Initialize the session storage for NADA
const storage = initializeStorage("nada");

type SessionStep = "input" | "review" | "voice";

interface NadaSession {
  currentStep: SessionStep;
  formattedScript: MeditationFormatterResult;
  voiceSettings?: {
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  };
}

interface NadaPageProps {
  sessionId?: string;
}

export function NadaPage({ sessionId }: NadaPageProps) {
  const router = useRouter();

  const [script, setScript] = useState("");
  const [formattedScript, setFormattedScript] =
    useState<MeditationFormatterResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentStep, setCurrentStep] = useState<SessionStep>("input");

  // If private mode is selected, clear the session by redirecting to base URL
  useEffect(() => {
    if (isPrivate && sessionId) {
      router.push("/nada");
    }
  }, [isPrivate, sessionId, router]);

  // Load session if ID is provided
  useEffect(() => {
    if (sessionId) {
      const session = storage.getSession<NadaSession>(sessionId);
      if (session) {
        setFormattedScript(session.formattedScript);
        setCurrentStep(session.currentStep);
      }
    }
    // Clean up old sessions on component mount
    storage.cleanupOldSessions();
  }, [sessionId]);

  // Save session to localStorage when state changes
  useEffect(() => {
    if (formattedScript) {
      storage.updateSessionIfExists<NadaSession>(sessionId, {
        currentStep,
        formattedScript,
      });
    }
  }, [sessionId, currentStep, formattedScript]);

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

      const data = await response.json();
      setFormattedScript(data);

      if (!isPrivate) {
        // Generate new session ID and update URL
        const newSessionId = storage.generateId();
        router.push(`/nada/${newSessionId}`);

        // Save initial session data
        storage.saveSession<NadaSession>(newSessionId, {
          currentStep: "review",
          formattedScript: data,
        });
      }

      setCurrentStep("review");
    } catch (error) {
      console.error("Error formatting script:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = async (voiceSettings: {
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  }) => {
    storage.updateSessionIfExists<NadaSession>(sessionId, { voiceSettings });

    // TODO: Implement audio generation
    console.log("Generating audio with settings:", voiceSettings);
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative ${
        isPrivate
          ? "bg-gradient-to-b from-slate-200 to-slate-300 border-8 border-slate-500"
          : "bg-gradient-to-b from-background to-muted"
      }`}
    >
      {isPrivate && (
        <div className="absolute top-0 left-0 right-0 bg-slate-300">
          <div className="py-2 text-sm text-center opacity-80">
            Private Session - Leave no trace
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-14">
        <main className="max-w-4xl w-full space-y-8">
          {currentStep === "review" && formattedScript ? (
            <Card className="p-6">
              <FormattedMeditation
                result={formattedScript}
                onConfirm={() => setCurrentStep("voice")}
              />
            </Card>
          ) : currentStep === "voice" ? (
            <VoiceSelection
              onGenerateAudio={handleGenerateAudio}
              onEditScript={() => setCurrentStep("review")}
            />
          ) : (
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
                      onClick={() => setIsPrivate(option.value)}
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
          )}
        </main>
      </div>
    </div>
  );
}
