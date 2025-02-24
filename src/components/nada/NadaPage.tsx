"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormattedMeditation } from "./FormattedMeditation";
import type { MeditationFormatterResult } from "@/lib/meditation-formatter";
import { VoiceSelection } from "./VoiceSelection";
import { PracticeSetup } from "./PracticeSetup";
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

  const [formattedScript, setFormattedScript] =
    useState<MeditationFormatterResult | null>(null);
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

  const handleScriptFormatted = (
    formattedScript: MeditationFormatterResult,
    isPrivate: boolean
  ) => {
    setFormattedScript(formattedScript);

    if (!isPrivate) {
      // Generate new session ID and update URL
      const newSessionId = storage.generateId();
      router.push(`/nada/${newSessionId}`);

      // Save initial session data
      storage.saveSession<NadaSession>(newSessionId, {
        currentStep: "review",
        formattedScript,
      });
    }

    setCurrentStep("review");
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
            <PracticeSetup
              isPrivate={isPrivate}
              onPrivateChange={setIsPrivate}
              onScriptFormatted={handleScriptFormatted}
            />
          )}
        </main>
      </div>
    </div>
  );
}
