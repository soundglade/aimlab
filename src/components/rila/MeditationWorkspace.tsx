import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  Settings2,
  Edit,
  Save,
  Loader,
  PenSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Meditation, MeditationStep, SynthesisState } from "./Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { VoiceSettings, TtsPreset } from "./steps/voice/ttsTypes";
import { KOKORO_SERVICE } from "./steps/voice/KokoroSettings";
import { ELEVENLABS_SERVICE } from "./steps/voice/ElevenLabsSettings";
import { useSynthesis } from "./steps/synthesis/useSynthesis";
import {
  MeditationStepDisplay,
  getStepStatus,
  useAudioPreview,
  StepStatus,
} from "./steps/synthesis/MeditationStepDisplay";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { createAudioUrl } from "./utils/audioUtils";
import { downloadAudioFile } from "./utils/audioExporter";
import { ShareResponse } from "./utils/shareService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface MeditationWorkspaceProps {
  meditation: Meditation;
  fileStorage: FileStorageApi;
  sessionId?: string;
  onMeditationUpdate: (updatedMeditation: Meditation) => void;
  onSynthesisStateUpdate: (synthesisState: SynthesisState) => void;
  synthesisState: SynthesisState;
  onShareMeditation: () => Promise<ShareResponse>;
  voiceSettings?: VoiceSettings;
  onVoiceSettingsUpdate?: (voiceSettings: VoiceSettings) => void;
}

export function MeditationWorkspace({
  meditation,
  fileStorage,
  sessionId,
  onMeditationUpdate,
  onSynthesisStateUpdate,
  synthesisState,
  onShareMeditation,
  voiceSettings: initialVoiceSettings,
  onVoiceSettingsUpdate,
}: MeditationWorkspaceProps) {
  // Voice settings state
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(
    initialVoiceSettings || {
      ttsService: "kokoro",
      ttsSettings: {
        model: "web",
        voiceId: "nicole",
        speed: 1.0,
      },
      isAdvancedMode: false,
    }
  );
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    if (initialVoiceSettings) {
      // Try to find a matching preset
      const matchingPreset = VOICE_PRESETS.find(
        (preset) =>
          preset.ttsService === initialVoiceSettings.ttsService &&
          preset.settings.voiceId === initialVoiceSettings.ttsSettings.voiceId
      );
      return matchingPreset?.id || "meditation-default";
    }
    return "meditation-default";
  });
  const [showAdvancedVoiceSettings, setShowAdvancedVoiceSettings] =
    useState(false);

  // Audio playback state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Editable text state - now we'll keep this always available
  const [editableTexts, setEditableTexts] = useState<Record<number, string>>(
    {}
  );
  const [editablePauseDurations, setEditablePauseDurations] = useState<
    Record<number, number>
  >({});

  // Track which steps are being edited
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);

  // Initialize editable texts from meditation steps
  useEffect(() => {
    const texts: Record<number, string> = {};
    const pauseDurations: Record<number, number> = {};

    meditation.steps.forEach((step, index) => {
      if (step.type === "speech" || step.type === "heading") {
        texts[index] = step.text;
      } else if (step.type === "pause") {
        pauseDurations[index] = step.durationMs ? step.durationMs / 1000 : 1;
      }
    });

    setEditableTexts(texts);
    setEditablePauseDurations(pauseDurations);
  }, [meditation]);

  // Synthesis state and derived values
  const isSynthesizing =
    synthesisState.started && synthesisState.progress < 100;
  const isGeneratingFullAudio =
    synthesisState.progress >= 90 && synthesisState.progress < 100;
  const isSynthesisComplete =
    synthesisState.started && synthesisState.progress === 100;
  const isUILocked = isSynthesizing || isGeneratingFullAudio;
  const progress = synthesisState.progress;

  // Synthesis functionality
  const { handleCancel, startSynthesis } = useSynthesis(
    meditation,
    voiceSettings,
    fileStorage,
    onMeditationUpdate,
    onSynthesisStateUpdate,
    () => {
      // Cancel handler
      onSynthesisStateUpdate({
        started: false,
        progress: 0,
        completedStepIndices: [],
      });
    },
    synthesisState,
    sessionId,
    false // Don't start synthesis automatically
  );

  // Audio preview functionality
  const { previewSection } = useAudioPreview(meditation, fileStorage);

  // Update voice settings
  const updateVoiceSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    if (onVoiceSettingsUpdate) {
      onVoiceSettingsUpdate(newSettings);
    }
  };

  // Load audio when synthesis is complete
  useEffect(() => {
    const loadAudio = async () => {
      if (isSynthesisComplete && meditation.fullAudioFileId && !audioUrl) {
        try {
          const storedFile = await fileStorage.getFile(
            meditation.fullAudioFileId
          );
          if (storedFile && storedFile.data) {
            const url = createAudioUrl(storedFile.data);
            setAudioUrl(url);

            const audio = new Audio(url);
            setAudioElement(audio);

            audio.addEventListener("timeupdate", () => {
              setCurrentTimeMs(audio.currentTime * 1000);
            });

            audio.addEventListener("ended", () => {
              setIsPlaying(false);
            });
          }
        } catch (error) {
          console.error("Failed to load audio:", error);
        }
      }
    };

    loadAudio();
  }, [isSynthesisComplete, meditation.fullAudioFileId, fileStorage, audioUrl]);

  // Handle text changes and auto-save
  const handleTextChange = (index: number, text: string) => {
    setEditableTexts((prev) => ({ ...prev, [index]: text }));
  };

  // Auto-save on blur
  const handleTextBlur = (index: number) => {
    saveEditForStep(index);
  };

  // Handle pause duration changes and auto-save
  const handlePauseDurationChange = (index: number, duration: number) => {
    setEditablePauseDurations((prev) => ({ ...prev, [index]: duration }));
  };

  // Auto-save pause duration on change
  const handlePauseDurationBlur = (index: number) => {
    saveEditForStep(index);
  };

  // Save edits for a specific step
  const saveEditForStep = (index: number) => {
    if (isUILocked) return;

    const updatedSteps = [...meditation.steps];
    const step = updatedSteps[index];

    if (step.type === "speech" || step.type === "heading") {
      if (
        editableTexts[index] !== undefined &&
        editableTexts[index] !== step.text
      ) {
        updatedSteps[index] = {
          ...step,
          text: editableTexts[index],
          // Clear audio file ID if text has changed
          audioFileId: undefined,
        };
      }
    } else if (step.type === "pause") {
      if (
        editablePauseDurations[index] !== undefined &&
        editablePauseDurations[index] * 1000 !== step.durationMs
      ) {
        updatedSteps[index] = {
          ...step,
          durationMs: editablePauseDurations[index] * 1000,
        };
      }
    }

    // Only update if changes were made
    if (JSON.stringify(updatedSteps) !== JSON.stringify(meditation.steps)) {
      const updatedMeditation = {
        ...meditation,
        steps: updatedSteps,
        // Clear full audio file ID if any step has changed
        fullAudioFileId: undefined,
        timeline: undefined,
      };

      onMeditationUpdate(updatedMeditation);

      // Reset synthesis state if changes were made
      if (isSynthesisComplete) {
        onSynthesisStateUpdate({
          started: false,
          progress: 0,
          completedStepIndices: [],
        });
      }
    }
  };

  // Handle voice preset change
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);

    const preset = VOICE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      updateVoiceSettings({
        ttsService: preset.ttsService,
        ttsSettings: {
          ...voiceSettings.ttsSettings,
          ...preset.settings,
        },
        isAdvancedMode: false,
      });
    }
  };

  // Handle playback controls
  const togglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    setCurrentTimeMs(0);
    if (!isPlaying) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (meditation.fullAudioFileId) {
      try {
        const storedFile = await fileStorage.getFile(
          meditation.fullAudioFileId
        );
        if (storedFile && storedFile.data) {
          const url = createAudioUrl(storedFile.data);
          downloadAudioFile(url, `${meditation.title}.wav`);
        }
      } catch (error) {
        console.error("Error downloading audio:", error);
      }
    }
  };

  // Handle share
  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await onShareMeditation();
      if (response.shareUrl) {
        setShareUrl(response.shareUrl);
        setShareDialogOpen(true);
      }
    } catch (error) {
      console.error("Error sharing meditation:", error);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle start synthesis
  const handleStartSynthesis = () => {
    startSynthesis();
  };

  // Start editing a step
  const startEditing = (index: number) => {
    if (isUILocked) return;
    setEditingStepIndex(index);
  };

  // Start editing the title
  const startEditingTitle = () => {
    if (isUILocked) return;
    setEditingTitle(true);
  };

  // Finish editing and save changes
  const finishEditing = () => {
    setEditingStepIndex(null);
    setEditingTitle(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left side - Meditation Title */}
            <div className="flex items-center">
              {editingTitle ? (
                <Input
                  value={meditation.title}
                  onChange={(e) => {
                    const updatedMeditation = {
                      ...meditation,
                      title: e.target.value,
                    };
                    onMeditationUpdate(updatedMeditation);
                  }}
                  onBlur={() => finishEditing()}
                  autoFocus
                  className="font-semibold text-lg border-none focus-visible:ring-0 p-0 max-w-[200px] sm:max-w-xs"
                  disabled={isUILocked}
                />
              ) : (
                <div
                  className="group relative cursor-pointer font-semibold text-lg truncate max-w-[200px] sm:max-w-xs"
                  onClick={() => startEditingTitle()}
                >
                  {meditation.title}
                  <PenSquare className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4 h-3.5 w-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
                </div>
              )}
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center gap-2">
              {!isUILocked && !isSynthesisComplete && (
                <div className="flex items-center gap-2">
                  <select
                    id="voice-preset"
                    value={selectedPreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {VOICE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowAdvancedVoiceSettings(!showAdvancedVoiceSettings)
                    }
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleStartSynthesis}
                    disabled={isUILocked}
                  >
                    Generate Audio
                  </Button>
                </div>
              )}

              {isSynthesisComplete && !isUILocked && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isUILocked}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    disabled={isUILocked || isSharing}
                  >
                    {isSharing ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" />
                    )}
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Advanced Voice Settings Panel */}
          {showAdvancedVoiceSettings && !isUILocked && !isSynthesisComplete && (
            <div className="py-2 border-t">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Label htmlFor="speed" className="w-20">
                    Speed
                  </Label>
                  <Slider
                    id="speed"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={[voiceSettings.ttsSettings.speed]}
                    onValueChange={(value) =>
                      updateVoiceSettings({
                        ...voiceSettings,
                        ttsSettings: {
                          ...voiceSettings.ttsSettings,
                          speed: value[0],
                        },
                      })
                    }
                    className="flex-1 max-w-xs"
                  />
                  <span className="w-12 text-right text-sm">
                    {voiceSettings.ttsSettings.speed}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Synthesis Progress */}
          {(isSynthesizing || isGeneratingFullAudio) && (
            <div className="py-2 border-t">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-muted-foreground">
                  {progress < 90
                    ? `Creating "${meditation.title}" meditation audio...`
                    : progress < 100
                    ? `Generating full audio file...`
                    : "Synthesis complete!"}
                </p>
                <div className="text-sm font-medium">
                  {Math.round(progress)}%
                </div>
              </div>
              <Progress value={progress} className="h-2" />

              {progress < 100 && (
                <div className="flex justify-end mt-1">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`pt-14 ${
          isSynthesisComplete && audioUrl ? "pb-14" : "pb-4"
        }`}
      >
        <div className="mx-auto max-w-3xl px-4 space-y-4 py-4">
          {meditation.steps.map((step, index) => {
            const status: StepStatus =
              synthesisState.completedStepIndices.includes(index)
                ? "complete"
                : currentlyPlaying === index
                ? "processing"
                : "pending";

            if (step.type === "heading") {
              return (
                <div key={index} className="space-y-1">
                  <Label
                    htmlFor={`heading-${index}`}
                    className="text-xs text-muted-foreground"
                  >
                    Heading
                  </Label>
                  {editingStepIndex === index ? (
                    <Input
                      id={`heading-${index}`}
                      value={editableTexts[index] || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      onBlur={() => {
                        handleTextBlur(index);
                        finishEditing();
                      }}
                      autoFocus
                      className={cn(
                        "font-medium",
                        step.level === 1 ? "text-xl" : "text-lg"
                      )}
                      disabled={isUILocked}
                    />
                  ) : (
                    <div
                      className={cn(
                        "group relative cursor-pointer rounded px-3 py-2 hover:bg-muted/50 transition-colors",
                        "font-medium",
                        step.level === 1 ? "text-xl" : "text-lg"
                      )}
                      onClick={() => startEditing(index)}
                    >
                      {step.text}
                      <PenSquare className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
                    </div>
                  )}
                </div>
              );
            } else if (step.type === "speech") {
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <Label
                      htmlFor={`speech-${index}`}
                      className="text-xs text-muted-foreground"
                    >
                      Speech
                    </Label>
                    {status === "complete" && step.audioFileId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => previewSection(index)}
                        className="h-5 px-2 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    )}
                  </div>
                  {editingStepIndex === index ? (
                    <Textarea
                      id={`speech-${index}`}
                      value={editableTexts[index] || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      onBlur={() => {
                        handleTextBlur(index);
                        finishEditing();
                      }}
                      autoFocus
                      className="min-h-24"
                      disabled={isUILocked}
                    />
                  ) : (
                    <div
                      className="group relative cursor-pointer rounded px-3 py-2 hover:bg-muted/50 transition-colors whitespace-pre-wrap"
                      onClick={() => startEditing(index)}
                    >
                      {step.text}
                      <PenSquare className="absolute right-2 top-4 h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
                    </div>
                  )}
                </div>
              );
            } else if (step.type === "pause") {
              return (
                <div key={index} className="space-y-1">
                  <Label
                    htmlFor={`pause-${index}`}
                    className="text-xs text-muted-foreground"
                  >
                    Pause Duration (seconds)
                  </Label>
                  {editingStepIndex === index ? (
                    <div className="flex items-center gap-4">
                      <Slider
                        id={`pause-${index}`}
                        min={1}
                        max={30}
                        step={1}
                        value={[editablePauseDurations[index] || 1]}
                        onValueChange={(value) =>
                          handlePauseDurationChange(index, value[0])
                        }
                        onValueCommit={() => {
                          handlePauseDurationBlur(index);
                          finishEditing();
                        }}
                        className="flex-1"
                        disabled={isUILocked}
                      />
                      <span className="w-12 text-right">
                        {editablePauseDurations[index] || 1}s
                      </span>
                    </div>
                  ) : (
                    <div
                      className="group relative cursor-pointer rounded px-3 py-2 hover:bg-muted/50 transition-colors"
                      onClick={() => startEditing(index)}
                    >
                      Pause for {step.durationMs ? step.durationMs / 1000 : 1}{" "}
                      seconds
                      <PenSquare className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
                    </div>
                  )}
                </div>
              );
            } else {
              // For other step types, just display them
              return (
                <MeditationStepDisplay
                  key={index}
                  section={step}
                  status={status}
                  onPreview={undefined}
                />
              );
            }
          })}
        </div>
      </div>

      {/* Bottom Navigation Bar - Fixed - Only shown when audio is available */}
      {isSynthesisComplete && audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto w-full max-w-5xl px-4">
            <div className="flex h-14 items-center justify-center">
              <div className="w-full max-w-md">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRestart}
                      disabled={isUILocked}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      onClick={togglePlayback}
                      disabled={isUILocked}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <Progress
                    value={
                      (currentTimeMs /
                        (meditation.timeline?.totalDurationMs || 1)) *
                      100
                    }
                    className="h-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Meditation</DialogTitle>
            <DialogDescription>
              Your meditation has been shared. Use the link below to access it.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2">
            <Input
              value={shareUrl || ""}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              onClick={() => {
                if (shareUrl) {
                  navigator.clipboard.writeText(shareUrl);
                }
              }}
            >
              Copy
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
