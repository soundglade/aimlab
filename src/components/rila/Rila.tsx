"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PracticeSetupStep } from "./steps/PracticeSetupStep";
import { MeditationWorkspace } from "./MeditationWorkspace";
import { VoiceSettings } from "./steps/voice/ttsTypes";

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

// Define the synthesis state type
export interface SynthesisState {
  started: boolean;
  progress: number;
  completedStepIndices: number[];
}

// Define the session type without steps
export interface RilaSession {
  meditation?: Meditation;
  voiceSettings?: VoiceSettings;
  synthesisState: SynthesisState;
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

interface RilaPageProps {
  sessionId?: string;
  isPrivate: boolean;
}

// Utility function to get the base path based on privacy setting
const getBasePath = (isPrivate: boolean) =>
  isPrivate ? "/rila/private" : "/rila";

export default function RilaPage({ sessionId, isPrivate }: RilaPageProps) {
  const router = useRouter();

  // Choose the appropriate storage based on privacy mode
  const sessionStorage = isPrivate ? ephemeralStorage : persistentStorage;
  const fileStorage = isPrivate ? ephemeralFileStorage : persistentFileStorage;

  // Initialize session state
  const [session, updateSession] = useSessionState<RilaSession>(
    sessionId,
    sessionStorage,
    {
      synthesisState: {
        started: false,
        progress: 0,
        completedStepIndices: [],
      },
    }
  );

  // Clean up old sessions on component mount
  useEffect(() => {
    sessionStorage.cleanupOldSessions();
  }, [sessionStorage]);

  const handleScriptCreated = (script: FormattedScript) => {
    // Convert the formatted script to a meditation
    const meditation = enhanceMeditation(script);

    // Create a new session with the meditation
    const newSession: RilaSession = {
      meditation,
      voiceSettings: {
        ttsService: "kokoro",
        ttsSettings: {
          model: "web",
          voiceId: "nicole",
          speed: 1.0,
        },
        isAdvancedMode: false,
      },
      synthesisState: {
        started: false,
        progress: 0,
        completedStepIndices: [],
      },
    };

    // Create a new session in storage
    const newSessionId = sessionStorage.generateId();
    sessionStorage.saveSession(newSessionId, newSession);

    // Redirect to the new session
    router.push(`${getBasePath(isPrivate)}/${newSessionId}`);
  };

  const handleGenerateAudio = async (settings: VoiceSettings) => {
    updateSession({
      voiceSettings: settings,
      synthesisState: {
        started: false,
        progress: 0,
        completedStepIndices: [],
      },
    });
  };

  const handleCancelSynthesis = () => {
    updateSession({
      synthesisState: {
        started: false,
        progress: 0,
        completedStepIndices: [],
      },
    });
  };

  const handleCompleteSynthesis = () => {
    // No need to change step anymore
  };

  const handleBackFromPlayer = () => {
    // No need to change step anymore
  };

  const handleShareMeditation = async () => {
    if (!session.meditation) {
      throw new Error("No meditation to share");
    }

    return shareMeditation(session.meditation, fileStorage);
  };

  const handleLoadSession = (loadSessionId: string) => {
    router.push(`${getBasePath(isPrivate)}/${loadSessionId}`);
  };

  const handleMeditationUpdate = (updatedMeditation: Meditation) => {
    updateSession({
      meditation: updatedMeditation,
    });
  };

  // Render the appropriate content based on whether we have a meditation
  const renderContent = () => {
    if (!session.meditation) {
      // If no meditation, show the setup step
      return (
        <div className="flex-1 flex flex-col items-center p-4 pt-14">
          <main className="max-w-4xl w-full space-y-8">
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
              sessionStorage={sessionStorage}
            />
          </main>
        </div>
      );
    } else {
      // If we have a meditation, show the workspace with no padding
      return (
        <div className="flex-1 flex flex-col w-full">
          <MeditationWorkspace
            meditation={session.meditation}
            fileStorage={fileStorage}
            sessionId={sessionId}
            onMeditationUpdate={handleMeditationUpdate}
            onSynthesisStateUpdate={(synthesisState) => {
              updateSession({ synthesisState });
            }}
            synthesisState={session.synthesisState}
            onShareMeditation={handleShareMeditation}
            voiceSettings={session.voiceSettings}
            onVoiceSettingsUpdate={(voiceSettings) => {
              updateSession({ voiceSettings });
            }}
          />
        </div>
      );
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative border-8 ${
        isPrivate ? "bg-slate-300 border-slate-500" : "border-transparent"
      } ${
        !session.meditation
          ? isPrivate
            ? "bg-gradient-to-b from-slate-200 to-slate-300"
            : "bg-gradient-to-b from-background to-muted"
          : isPrivate
          ? "bg-slate-300"
          : "bg-background"
      }`}
    >
      {isPrivate && (
        <div className="absolute top-0 left-0 right-0 bg-slate-300">
          <div className="py-2 text-sm text-center opacity-80">
            Private Session - Leave no trace
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}
