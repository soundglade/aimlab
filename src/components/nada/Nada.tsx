"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

import { FormattedMeditation } from "./steps/FormattedMeditation";
import { VoiceSelection } from "./steps/VoiceSelection";
import { PracticeSetup } from "./steps/PracticeSetup";
import { SynthesisProgress } from "./steps/Synthesis";
import { MeditationPlayer } from "./steps/MeditationPlayer";

import { Timing } from "./utils/meditationTimeline";

import type { FormattedScript } from "@/lib/meditation-formatter";
import { initializeStorage } from "@/lib/session-storage";
import { useSessionState } from "@/lib/use-session-state";
import { initializeFileStorage } from "@/lib/file-storage";

// Initialize both storage instances outside the component
const persistentStorage = initializeStorage("nada", { ephemeral: false });
const ephemeralStorage = initializeStorage("nada", { ephemeral: true });

// Initialize both file storage instances
const persistentFileStorage = initializeFileStorage("nada", {
  ephemeral: false,
});
const ephemeralFileStorage = initializeFileStorage("nada", { ephemeral: true });

// Update the SessionStep type to include the new player step
type SessionStep = "input" | "review" | "voice" | "synthesis" | "player";

// Enhanced types for frontend use with audio capabilities
export type MeditationStep = FormattedScript["steps"][number] & {
  audioFileId?: string;
  durationMs?: number;
};

export interface Meditation {
  title: string;
  steps: MeditationStep[];
  timeline?: {
    timings: Timing[];
    totalDurationMs: number;
  };
  fullAudioFileId?: string;
}

// Helper function to convert from backend FormattedScript to frontend Meditation
export function enhanceMeditation(script: FormattedScript): Meditation {
  return {
    title: script.title,
    steps: script.steps.map((step) => ({
      ...step,
      audioFileId: undefined,
      durationMs: step.type === "pause" ? step.duration * 1000 : undefined,
    })),
  };
}

interface NadaSession {
  currentStep: SessionStep;
  meditation: Meditation | null;
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

  // Select the appropriate storage based on privacy mode
  const sessionStorage = isPrivate ? ephemeralStorage : persistentStorage;
  const fileStorage = isPrivate ? ephemeralFileStorage : persistentFileStorage;

  // Use our custom hook to manage session state
  const [session, updateSession] = useSessionState<NadaSession>(
    sessionId,
    sessionStorage,
    { currentStep: "input", meditation: null }
  );

  // Load saved sessions directly
  const savedSessions = sessionStorage.getAllSessions<{
    meditation: Meditation;
  }>();

  // Clean up old sessions on component mount
  useEffect(() => {
    sessionStorage.cleanupOldSessions();
  }, [sessionStorage]);

  const handleScriptCreated = (script: FormattedScript) => {
    // Generate new session ID if we don't have one
    const newSessionId = sessionId || sessionStorage.generateId();

    // Create the new session state
    const newSessionState = {
      currentStep: "review" as const,
      meditation: enhanceMeditation(script),
    };

    if (!sessionId) {
      sessionStorage.saveSession(newSessionId, newSessionState);
    } else {
      updateSession(newSessionState);
    }

    router.push(`${getBasePath(isPrivate)}/${newSessionId}`);
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

  const handleCompleteSynthesis = () => {
    updateSession({
      currentStep: "player",
    });
  };

  const handleBackFromPlayer = () => {
    updateSession({
      currentStep: "synthesis",
    });
  };

  const handleLoadSession = (loadSessionId: string) => {
    router.push(`${getBasePath(isPrivate)}/${loadSessionId}`);
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
          {session.currentStep === "review" && session.meditation ? (
            <Card className="p-6">
              <FormattedMeditation
                meditation={session.meditation}
                onConfirm={() => updateSession({ currentStep: "voice" })}
              />
            </Card>
          ) : session.currentStep === "voice" && session.meditation ? (
            <VoiceSelection
              onGenerateAudio={handleGenerateAudio}
              onEditScript={() => updateSession({ currentStep: "review" })}
            />
          ) : session.currentStep === "synthesis" &&
            session.meditation &&
            session.voiceSettings ? (
            <SynthesisProgress
              meditation={session.meditation}
              voiceSettings={session.voiceSettings}
              onCancel={handleCancelSynthesis}
              onComplete={handleCompleteSynthesis}
              fileStorage={fileStorage}
              sessionId={sessionId}
              onMeditationUpdate={(updatedMeditation) => {
                updateSession({
                  ...session,
                  meditation: updatedMeditation,
                });
              }}
            />
          ) : session.currentStep === "player" && session.meditation ? (
            <MeditationPlayer
              meditation={session.meditation}
              fileStorage={fileStorage}
              onBack={handleBackFromPlayer}
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
