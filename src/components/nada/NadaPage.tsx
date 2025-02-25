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

// Initialize both storage instances outside the component
const persistentStorage = initializeStorage("nada", { ephemeral: false });
const ephemeralStorage = initializeStorage("nada", { ephemeral: true });

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
  isPrivate: boolean;
}

// Utility function to get the base path based on privacy setting
const getBasePath = (isPrivate: boolean) =>
  isPrivate ? "/nada/private" : "/nada";

export default function NadaPage({ sessionId, isPrivate }: NadaPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SessionStep>("input");
  const [formattedResult, setFormattedResult] =
    useState<MeditationFormatterResult | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<{
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  } | null>(null);

  // Simply select the appropriate storage based on isPrivate
  const storage = isPrivate ? ephemeralStorage : persistentStorage;

  // Load saved sessions directly
  const savedSessions = storage.getAllSessions<{
    script: FormattedScript;
  }>();

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
  }, [sessionId, storage]);

  // Save session to storage when state changes
  useEffect(() => {
    if (formattedResult && sessionId) {
      storage.updateSessionIfExists<NadaSession>(sessionId, {
        currentStep,
        script: formattedResult.script,
        voiceSettings: voiceSettings || undefined,
      });
    }
  }, [sessionId, currentStep, formattedResult, voiceSettings, storage]);

  const handleScriptFormatted = (
    formattedResult: MeditationFormatterResult
  ) => {
    setFormattedResult(formattedResult);

    // Only proceed if we have a valid script
    if (!formattedResult.isRejected && formattedResult.script) {
      // Generate new session ID
      const newSessionId = storage.generateId();

      // Save initial session data
      storage.saveSession<NadaSession>(newSessionId, {
        currentStep: "review",
        script: formattedResult.script,
      });

      // Always update URL with the session ID, preserving the privacy setting
      router.push(`${getBasePath(isPrivate)}/${newSessionId}`);

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

    if (sessionId) {
      storage.updateSessionIfExists<NadaSession>(sessionId, {
        voiceSettings: settings,
      });
    }

    setCurrentStep("synthesis");
  };

  const handleCancelSynthesis = () => {
    setCurrentStep("voice");
  };

  const handleLoadSession = (sessionId: string) => {
    if (sessionId) {
      // Navigate to the session page, preserving the privacy setting
      router.push(`${getBasePath(isPrivate)}/${sessionId}`);
    }
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
              onPrivateChange={(newIsPrivate) => {
                // Redirect to the appropriate URL when privacy mode changes
                if (newIsPrivate !== isPrivate) {
                  router.push(getBasePath(newIsPrivate));
                }
              }}
              onScriptFormatted={handleScriptFormatted}
              onLoadSession={handleLoadSession}
              savedSessions={savedSessions}
            />
          )}
        </main>
      </div>
    </div>
  );
}
