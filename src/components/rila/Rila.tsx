"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Timing } from "./utils/meditationTimeline";

import type { FormattedScript } from "@/lib/meditation-formatter";
import { initializeStorage } from "@/lib/session-storage";
import { useSessionState } from "@/lib/use-session-state";
import { initializeFileStorage } from "@/lib/file-storage";
import { shareMeditation } from "./utils/shareService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { SavedMeditations } from "./steps/setup/SavedMeditations";
import { AdvancedVoiceSettings } from "./steps/voice/AdvancedVoiceSettings";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Play, Settings2 } from "lucide-react";
import { Layout } from "@/components/layouts/Layout";

// Import TTS services and types
import { VoiceSettings, TtsPreset } from "./steps/voice/ttsTypes";
import { KOKORO_SERVICE } from "./steps/voice/KokoroSettings";
import { ELEVENLABS_SERVICE } from "./steps/voice/ElevenLabsSettings";

// -------------------------------------------------------------------------
// Types and Interfaces
// -------------------------------------------------------------------------

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

interface RilaPageProps {
  sessionId?: string;
  isPrivate?: boolean;
}

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

// Collection of all available TTS services
const TTS_SERVICES = [KOKORO_SERVICE, ELEVENLABS_SERVICE];

const VOICE_PRESETS: TtsPreset[] = [
  {
    id: "meditation-default",
    name: "Meditation Default",
    description: "Nicole's whispering voice at a gentle pace",
    settings: {
      model: "web",
      voiceId: "nicole",
      speed: 1.0,
    },
    ttsService: "kokoro",
  },
  {
    id: "guided-relaxation",
    name: "Guided Relaxation",
    description: "James's soothing British voice at a slower pace",
    settings: {
      model: "web",
      voiceId: "james",
      speed: 0.8,
    },
    ttsService: "kokoro",
  },
  {
    id: "energetic-meditation",
    name: "Energetic Meditation",
    description: "Bella's passionate voice at a moderate pace",
    settings: {
      model: "web",
      voiceId: "bella",
      speed: 1.2,
    },
    ttsService: "kokoro",
  },
];

// Initialize storage instances
const sessionStorage = initializeStorage("rila", { ephemeral: false });
const fileStorage = initializeFileStorage("rila", { ephemeral: false });

// -------------------------------------------------------------------------
// Helper Functions
// -------------------------------------------------------------------------

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

// -------------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------------

export default function RilaPage({
  sessionId,
  isPrivate = false,
}: RilaPageProps) {
  const router = useRouter();

  // -------------------------------------------------------------------------
  // State Management
  // -------------------------------------------------------------------------

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

  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to Kokoro TTS
  const defaultSettings: VoiceSettings = {
    ttsService: KOKORO_SERVICE.id,
    ttsSettings: KOKORO_SERVICE.defaultSettings,
    isAdvancedMode: false,
  };

  const voiceSettings = session.voiceSettings;

  // Voice settings state
  const [settings, setSettings] = useState<VoiceSettings>(
    voiceSettings || defaultSettings
  );
  const [isAdvancedMode, setIsAdvancedMode] = useState(settings.isAdvancedMode);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [previewTextInput, setPreviewTextInput] = useState(
    TTS_SERVICES.find((s) => s.id === settings.ttsService)
      ?.defaultPreviewText || KOKORO_SERVICE.defaultPreviewText
  );

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  // Clean up old sessions on component mount
  useEffect(() => {
    sessionStorage.cleanupOldSessions();
  }, [sessionStorage]);

  // Update state if props change
  useEffect(() => {
    if (voiceSettings) {
      setSettings(voiceSettings);
      setIsAdvancedMode(voiceSettings.isAdvancedMode);

      // Find matching preset for simple mode
      if (!voiceSettings.isAdvancedMode) {
        const presetIndex = VOICE_PRESETS.findIndex((preset) => {
          const presetVoiceId = preset.settings.voiceId;
          const currentVoiceId = voiceSettings.ttsSettings.voiceId;
          const presetService = preset.ttsService;
          const currentService = voiceSettings.ttsService;
          return (
            presetVoiceId === currentVoiceId && presetService === currentService
          );
        });

        if (presetIndex !== -1) {
          setSelectedPreset(presetIndex);
        }
      }
    }
  }, [voiceSettings]);

  // -------------------------------------------------------------------------
  // Event Handlers
  // -------------------------------------------------------------------------

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
          mode: "standard",
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
      handleScriptCreated(formattedResult.script);
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
    router.push(`/rila/${newSessionId}`);
  };

  const handleVoiceSettingsUpdate = async (settings: VoiceSettings) => {
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

  const handleShareMeditation = async () => {
    if (!session.meditation) {
      throw new Error("No meditation to share");
    }

    return shareMeditation(session.meditation, fileStorage);
  };

  const handleLoadSession = (loadSessionId: string) => {
    router.push(`/rila/${loadSessionId}`);
  };

  const handleMeditationUpdate = (updatedMeditation: Meditation) => {
    updateSession({
      meditation: updatedMeditation,
    });
  };

  // Toggle between simple and advanced voice settings modes
  const handleModeToggle = (advanced: boolean) => {
    setIsAdvancedMode(advanced);

    if (!advanced) {
      // Switch to simple mode using the first preset by default
      let bestPresetIndex = 0;

      // Try to find a matching preset if already using the same service
      const currentService = settings.ttsService;
      const matchingPresets = VOICE_PRESETS.filter(
        (p) => p.ttsService === currentService
      );

      if (matchingPresets.length > 0) {
        const matchingPreset = matchingPresets.findIndex(
          (p) => p.settings.voiceId === settings.ttsSettings.voiceId
        );
        if (matchingPreset !== -1) {
          bestPresetIndex = VOICE_PRESETS.findIndex(
            (p) => p === matchingPresets[matchingPreset]
          );
        }
      }

      setSelectedPreset(bestPresetIndex);
      const selectedPresetData = VOICE_PRESETS[bestPresetIndex];
      setSettings({
        ttsService: selectedPresetData.ttsService,
        ttsSettings: selectedPresetData.settings,
        isAdvancedMode: false,
      });
    } else {
      // Just update the mode flag when switching to advanced
      setSettings((prev) => ({
        ...prev,
        isAdvancedMode: true,
      }));
    }
  };

  // Handle preset selection in simple mode
  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    const selectedPresetData = VOICE_PRESETS[index];
    setSettings({
      ttsService: selectedPresetData.ttsService,
      ttsSettings: selectedPresetData.settings,
      isAdvancedMode: false,
    });
  };

  // -------------------------------------------------------------------------
  // Rendering Logic
  // -------------------------------------------------------------------------

  const renderContent = () => {
    if (!session.meditation) {
      return (
        <div className="flex-1 flex flex-col items-center p-4 pt-14">
          <main className="max-w-4xl w-full space-y-8">
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="space-y-6 text-center">
                <h1 className="text-4xl font-medium tracking-tight text-foreground">
                  Create Your Guided Meditation
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <SavedMeditations
                  sessionStorage={sessionStorage}
                  onLoadSession={handleLoadSession}
                />

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

                <h1 className="text-2xl font-medium text-center">
                  Choose a Voice
                </h1>
                <Card className="p-6 space-y-6">
                  <div className="space-y-6">
                    {/* Mode Toggle - Conditional UI */}
                    <div className="flex justify-end">
                      {isAdvancedMode ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleModeToggle(false)}
                          >
                            Presets
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModeToggle(true)}
                          className="flex items-center gap-1"
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                          Advanced Options
                        </Button>
                      )}
                    </div>

                    {!isAdvancedMode ? (
                      // Simple Mode - Preset Voice Options (now using VOICE_PRESETS)
                      <div className="space-y-6">
                        <div>
                          <RadioGroup
                            value={String(selectedPreset)}
                            onValueChange={(value) =>
                              handlePresetChange(parseInt(value))
                            }
                            className="space-y-4"
                          >
                            {VOICE_PRESETS.map((preset, index) => (
                              <label
                                key={preset.id}
                                htmlFor={preset.id}
                                className="cursor-pointer block"
                              >
                                <div className="flex items-start space-x-3 border rounded-md p-4 hover:bg-muted transition-colors">
                                  <RadioGroupItem
                                    value={String(index)}
                                    id={preset.id}
                                    className="mt-1"
                                  />
                                  <div className="flex-grow">
                                    <span className="text-base font-medium">
                                      {preset.name}
                                    </span>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {preset.description}
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        console.log(
                                          "Playing preview with preset:",
                                          {
                                            ttsService: preset.ttsService,
                                            ttsSettings: preset.settings,
                                          }
                                        );
                                      }}
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      Preview
                                    </Button>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    ) : (
                      // Advanced Mode - Now using the separate component
                      <AdvancedVoiceSettings
                        settings={settings}
                        previewTextInput={previewTextInput}
                        setPreviewTextInput={setPreviewTextInput}
                        onSettingsChange={setSettings}
                      />
                    )}
                  </div>
                </Card>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center pt-2">
                  <Button type="submit" size="lg" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Generate Meditation"}
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout>
      <div className="w-full flex flex-col relative">{renderContent()}</div>
    </Layout>
  );
}
