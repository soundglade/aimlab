"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FormatReviewStep } from "./steps/FormatReviewStep";
import { VoiceSelectionStep } from "./steps/VoiceSelectionStep";
import { PracticeSetupStep } from "./steps/PracticeSetupStep";
import { SynthesisProgressStep } from "./steps/SynthesisStep";
import { MeditationPlayerStep } from "./steps/MeditationPlayerStep";

import { Timing } from "./utils/meditationTimeline";

import type { FormattedScript } from "@/lib/meditation-formatter";
import { initializeStorage } from "@/lib/session-storage";
import { useSessionState } from "@/lib/use-session-state";
import { initializeFileStorage } from "@/lib/file-storage";
import { shareMeditation } from "./utils/shareService";

// Initialize both storage instances outside the component
const persistentStorage = initializeStorage("rila", { ephemeral: false });
const ephemeralStorage = initializeStorage("rila", { ephemeral: true });

// Initialize both file storage instances
const persistentFileStorage = initializeFileStorage("rila", {
  ephemeral: false,
});
const ephemeralFileStorage = initializeFileStorage("rila", { ephemeral: true });

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

// Voice settings type for reuse
type VoiceSettings = {
  voiceId: string;
  customVoiceId?: string;
  isAdvanced: boolean;
};

// Define the state machine states - using a single type for the session
type RilaSession =
  | { step: "input" }
  | { step: "review"; meditation: Meditation }
  | { step: "voice"; meditation: Meditation }
  | { step: "synthesis"; meditation: Meditation; voiceSettings: VoiceSettings }
  | { step: "player"; meditation: Meditation; voiceSettings: VoiceSettings };

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

interface RilaPageProps {
  sessionId?: string;
  isPrivate: boolean;
}

// Utility function to get the base path based on privacy setting
const getBasePath = (isPrivate: boolean) =>
  isPrivate ? "/rila/private" : "/rila";

export default function RilaPage({ sessionId, isPrivate }: RilaPageProps) {
  const router = useRouter();

  // Select the appropriate storage based on privacy mode
  const sessionStorage = isPrivate ? ephemeralStorage : persistentStorage;
  const fileStorage = isPrivate ? ephemeralFileStorage : persistentFileStorage;

  // Use our custom hook to manage session state
  const [session, updateSession] = useSessionState<RilaSession>(
    sessionId,
    sessionStorage,
    { step: "input" }
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
    const newSessionState: RilaSession = {
      step: "review",
      meditation: enhanceMeditation(script),
    };

    if (!sessionId) {
      sessionStorage.saveSession(newSessionId, newSessionState);
    } else {
      updateSession(newSessionState);
    }

    router.push(`${getBasePath(isPrivate)}/${newSessionId}`);
  };

  const handleGenerateAudio = async (settings: VoiceSettings) => {
    updateSession({
      step: "synthesis",
      voiceSettings: settings,
    });
  };

  const handleCancelSynthesis = () => {
    updateSession({
      step: "voice",
    });
  };

  const handleCompleteSynthesis = () => {
    updateSession({
      step: "player",
    });
  };

  const handleBackFromPlayer = () => {
    updateSession({
      step: "synthesis",
      voiceSettings: {
        voiceId: "default", // Fallback value
        isAdvanced: false,
      },
    });
  };

  const handleShareMeditation = async () => {
    if (session.step !== "player")
      throw new Error("Cannot share meditation in this step");

    return shareMeditation(session.meditation, fileStorage);
  };

  const handleLoadSession = (loadSessionId: string) => {
    router.push(`${getBasePath(isPrivate)}/${loadSessionId}`);
  };

  // For conciseness in the render logic
  const { step } = session;

  // Map steps to their corresponding components
  const renderStepContent = () => {
    switch (step) {
      case "input":
        return (
          <PracticeSetupStep
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
        );
      case "review":
        return (
          <FormatReviewStep
            meditation={session.meditation}
            onConfirm={() =>
              updateSession({
                step: "voice",
              })
            }
          />
        );
      case "voice":
        return (
          <VoiceSelectionStep
            onGenerateAudio={handleGenerateAudio}
            onEditScript={() =>
              updateSession({
                step: "review",
              })
            }
          />
        );
      case "synthesis":
        return (
          <SynthesisProgressStep
            meditation={session.meditation}
            voiceSettings={session.voiceSettings}
            onCancel={handleCancelSynthesis}
            onComplete={handleCompleteSynthesis}
            fileStorage={fileStorage}
            sessionId={sessionId}
            onMeditationUpdate={(updatedMeditation) => {
              updateSession({
                meditation: updatedMeditation,
              });
            }}
          />
        );
      case "player":
        return (
          <MeditationPlayerStep
            meditation={session.meditation}
            fileStorage={fileStorage}
            onBack={handleBackFromPlayer}
            onShareMeditation={handleShareMeditation}
          />
        );
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative border-8 ${
        isPrivate
          ? "bg-gradient-to-b from-slate-200 to-slate-300 border-slate-500"
          : "bg-gradient-to-b from-background to-muted border-transparent"
      }`}
    >
      {isPrivate && (
        <div className="absolute top-0 left-0 right-0 bg-slate-300">
          <div className="py-2 text-sm text-center opacity-80">
            Private Session - Leave no trace
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center p-4 pt-14">
        <main className="max-w-4xl w-full space-y-8">
          {renderStepContent()}
        </main>
      </div>
    </div>
  );
}
