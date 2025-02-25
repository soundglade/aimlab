"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormattedMeditation } from "./FormattedMeditation";
import type {
  MeditationFormatterResult,
  FormattedScript,
} from "@/lib/meditation-formatter";
import { VoiceSelection } from "./VoiceSelection";
import { PracticeSetup } from "./PracticeSetup";
import { SynthesisProgress } from "./SynthesisProgress";
import { initializeStorage } from "@/lib/session-storage";

// Initialize the session storage for NADA
const storage = initializeStorage("nada");

type SessionStep = "input" | "review" | "voice" | "synthesis";

interface NadaSession {
  currentStep: SessionStep;
  script: FormattedScript;
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
  const [currentStep, setCurrentStep] = useState<SessionStep>("input");
  const [isPrivate, setIsPrivate] = useState(false);
  const [formattedResult, setFormattedResult] =
    useState<MeditationFormatterResult | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<{
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  } | null>(null);

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
        // Set the current step from the session
        setCurrentStep(session.currentStep);

        // Create a formatted result from the session script
        if (session.script) {
          setFormattedResult({
            isRejected: false,
            warnings: [],
            script: session.script,
          });
        }

        if (session.voiceSettings) {
          setVoiceSettings(session.voiceSettings);
        }
      }
    }
    // Clean up old sessions on component mount
    storage.cleanupOldSessions();
  }, [sessionId]);

  // Save session to localStorage when state changes
  useEffect(() => {
    if (formattedResult && !isPrivate) {
      storage.updateSessionIfExists<NadaSession>(sessionId, {
        currentStep,
        script: formattedResult.script,
        voiceSettings: voiceSettings || undefined,
      });
    }
  }, [sessionId, currentStep, formattedResult, voiceSettings, isPrivate]);

  const handleScriptFormatted = (
    formattedResult: MeditationFormatterResult,
    isPrivate: boolean
  ) => {
    setFormattedResult(formattedResult);
    setIsPrivate(isPrivate);

    // Only proceed if we have a valid script
    if (!formattedResult.isRejected && formattedResult.script) {
      // If not private, save to session storage
      if (!isPrivate) {
        // Generate new session ID and update URL
        const newSessionId = storage.generateId();
        router.push(`/nada/${newSessionId}`);

        // Save initial session data
        storage.saveSession<NadaSession>(newSessionId, {
          currentStep: "review",
          script: formattedResult.script,
        });
      }

      // Change to review step
      setCurrentStep("review");
    }
    // If rejected or no script, we stay on the input step
    // The PracticeSetup component will display the error
  };

  const handleGenerateAudio = async (settings: {
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  }) => {
    setVoiceSettings(settings);
    if (!isPrivate) {
      storage.updateSessionIfExists<NadaSession>(sessionId, {
        voiceSettings: settings,
      });
    }
    setCurrentStep("synthesis");
  };

  const handleCancelSynthesis = () => {
    setCurrentStep("voice");
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
          {currentStep === "review" &&
          formattedResult &&
          formattedResult.script ? (
            <Card className="p-6">
              <FormattedMeditation
                result={formattedResult}
                onConfirm={() => setCurrentStep("voice")}
              />
            </Card>
          ) : currentStep === "voice" && formattedResult?.script ? (
            <VoiceSelection
              onGenerateAudio={handleGenerateAudio}
              onEditScript={() => setCurrentStep("review")}
            />
          ) : currentStep === "synthesis" &&
            formattedResult?.script &&
            voiceSettings ? (
            <SynthesisProgress
              script={formattedResult.script}
              voiceSettings={voiceSettings}
              onCancel={handleCancelSynthesis}
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
