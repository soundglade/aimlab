"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormattedMeditation } from "./FormattedMeditation";
import type { FormattedScript } from "@/lib/meditation-formatter";
import { VoiceSelection } from "./VoiceSelection";
import { PracticeSetup } from "./PracticeSetup";
import { SynthesisProgress } from "./SynthesisProgress";
import { initializeStorage } from "@/lib/session-storage";
import { useSessionState } from "@/lib/use-session-state";

// Initialize both storage instances outside the component
const persistentStorage = initializeStorage("nada", { ephemeral: false });
const ephemeralStorage = initializeStorage("nada", { ephemeral: true });

type SessionStep = "input" | "review" | "voice" | "synthesis";

interface NadaSession {
  currentStep: SessionStep;
  script: FormattedScript | null;
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

  // Simply select the appropriate storage based on isPrivate
  const storage = isPrivate ? ephemeralStorage : persistentStorage;

  // Use our custom hook to manage session state
  const [session, updateSession] = useSessionState<NadaSession>(
    sessionId,
    storage,
    { currentStep: "input", script: null }
  );

  // Load saved sessions directly
  const savedSessions = storage.getAllSessions<{
    script: FormattedScript;
  }>();

  // Clean up old sessions on component mount
  useEffect(() => {
    storage.cleanupOldSessions();
  }, [storage]);

  const handleScriptCreated = (script: FormattedScript) => {
    // Generate new session ID if we don't have one
    const newSessionId = sessionId || storage.generateId();

    // Create the new session state
    const newSessionState = {
      currentStep: "review" as const,
      script,
    };

    // Update local state
    updateSession(newSessionState);

    // If this is a new session, save it directly
    if (!sessionId) {
      storage.saveSession(newSessionId, newSessionState);

      // Navigate to the new session
      router.push(`${getBasePath(isPrivate)}/${newSessionId}`);
    }
  };

  const handleGenerateAudio = async (settings: {
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  }) => {
    updateSession({
      voiceSettings: settings,
      currentStep: "synthesis",
    });
  };

  const handleCancelSynthesis = () => {
    updateSession({
      currentStep: "voice",
    });
  };

  const handleLoadSession = (loadSessionId: string) => {
    if (loadSessionId) {
      // Navigate to the session page, preserving the privacy setting
      router.push(`${getBasePath(isPrivate)}/${loadSessionId}`);
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
          {session.currentStep === "review" && session.script ? (
            <Card className="p-6">
              <FormattedMeditation
                script={session.script}
                onConfirm={() => updateSession({ currentStep: "voice" })}
              />
            </Card>
          ) : session.currentStep === "voice" && session.script ? (
            <VoiceSelection
              onGenerateAudio={handleGenerateAudio}
              onEditScript={() => updateSession({ currentStep: "review" })}
            />
          ) : session.currentStep === "synthesis" &&
            session.script &&
            session.voiceSettings ? (
            <SynthesisProgress
              script={session.script}
              voiceSettings={session.voiceSettings}
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
              onScriptCreated={handleScriptCreated}
              onLoadSession={handleLoadSession}
              savedSessions={savedSessions}
            />
          )}
        </main>
      </div>
    </div>
  );
}
