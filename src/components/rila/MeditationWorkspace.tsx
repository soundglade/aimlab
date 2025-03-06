import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  SkipBack,
  Download,
  Share2,
  Settings2,
  Loader,
  PenSquare,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Meditation, SynthesisState } from "./Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { VoiceSettings, TtsPreset } from "./steps/voice/ttsTypes";
import { useSynthesis } from "./steps/synthesis/useSynthesis";
import { useAudioPreview } from "./steps/synthesis/MeditationStepDisplay";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { createAudioUrl, getAudioBlob } from "./utils/audioUtils";
import { downloadAudioFile } from "./utils/audioExporter";
import { ShareResponse } from "./utils/shareService";
import { MeditationStep } from "./MeditationStep";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // Add selected step state
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(
    null
  );

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
    // Clear selection when editing starts
    setSelectedStepIndex(null);
  };

  // Start editing the title
  const startEditingTitle = () => {
    if (isUILocked) return;
    setEditingTitle(true);
    // Clear selection when editing title
    setSelectedStepIndex(null);
  };

  // Finish editing and save changes
  const finishEditing = () => {
    setEditingStepIndex(null);
    setEditingTitle(false);
  };

  // Handle click on the container to clear selection
  const handleContainerClick = (e: React.MouseEvent) => {
    // Only clear selection if clicking directly on the container, not on a step
    if (e.target === e.currentTarget) {
      setSelectedStepIndex(null);
    }
  };

  // Track if a step's text has been modified after audio generation
  const isStepOutOfSync = (index: number) => {
    const step = meditation.steps[index];
    if (!step.audioFileId) return false;

    if (step.type === "speech" || step.type === "heading") {
      return editableTexts[index] !== step.text;
    } else if (step.type === "pause") {
      return editablePauseDurations[index] * 1000 !== step.durationMs;
    }

    return false;
  };

  // Generate audio for a specific step
  const handleGenerateStepAudio = async (index: number) => {
    // If the step is out of sync, we need to save the changes first
    if (isStepOutOfSync(index)) {
      saveEditForStep(index);
    }

    const step = meditation.steps[index];

    // Only speech and heading steps can have audio
    if (step.type !== "speech" && step.type !== "heading") {
      return;
    }

    // Set synthesis state to started with only this step as target
    onSynthesisStateUpdate({
      started: true,
      progress: 0,
      completedStepIndices: [],
    });

    try {
      // Call the synthesizeText API with the step text
      const response = await fetch("/api/synthesize-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: step.text,
        }),
      });

      if (!response.ok) {
        throw new Error("Text synthesis failed");
      }

      const result = await response.json();

      // Create a Blob from the base64 audio data
      const audioBlob = getAudioBlob(result.audio, "audio/mp3");

      // Save the audio blob to file storage
      const fileId = await fileStorage.saveFile(audioBlob, {
        projectId: "rila",
        groupId: sessionId,
        contentType: "audio/mp3",
      });

      // Update the meditation with the new audio file ID and duration
      step.audioFileId = fileId;
      step.durationMs = result.durationMs;

      // Update the meditation
      onMeditationUpdate(meditation);

      // Update synthesis state to completed
      onSynthesisStateUpdate({
        started: false,
        progress: 100,
        completedStepIndices: [...synthesisState.completedStepIndices, index],
      });
    } catch (error) {
      console.error("Error generating step audio:", error);

      // Update synthesis state to indicate failure
      onSynthesisStateUpdate({
        started: false,
        progress: 0,
        completedStepIndices: synthesisState.completedStepIndices,
      });
    }
  };

  // Clear selection when UI is locked
  useEffect(() => {
    if (isUILocked) {
      setSelectedStepIndex(null);
    }
  }, [isUILocked]);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-3xl px-4">
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
        <div
          className="mx-auto max-w-3xl px-4 space-y-4 py-4"
          onClick={handleContainerClick}
        >
          {meditation.steps.map((step, index) => {
            const isAudioGenerated = !!step.audioFileId;
            const isOutOfSync = isStepOutOfSync(index);

            return (
              <MeditationStep
                key={index}
                step={step}
                index={index}
                isEditing={editingStepIndex === index}
                isSelected={selectedStepIndex === index}
                editableText={editableTexts[index] || ""}
                editablePauseDuration={editablePauseDurations[index] || 1}
                onEdit={() => startEditing(index)}
                onTextChange={(text) => handleTextChange(index, text)}
                onPauseDurationChange={(duration) =>
                  handlePauseDurationChange(index, duration)
                }
                onBlur={() => {
                  if (step.type === "pause") {
                    handlePauseDurationBlur(index);
                  } else {
                    handleTextBlur(index);
                  }
                  finishEditing();
                }}
                onPreview={
                  step.audioFileId ? () => previewSection(index) : undefined
                }
                isAudioGenerated={isAudioGenerated}
                isAudioOutOfSync={isOutOfSync}
                onGenerateAudio={() => handleGenerateStepAudio(index)}
                isUILocked={isUILocked}
                onSelect={() => {
                  setSelectedStepIndex(index);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Bar - Fixed */}

      <div className="fixed bottom-0 left-0 right-0 py-3 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="flex h-14 items-center justify-center">
            <div className="w-full max-w-md">
              <div className="flex flex-col space-y-2">
                <Progress
                  value={
                    (currentTimeMs /
                      (meditation.timeline?.totalDurationMs || 1)) *
                    100
                  }
                  className="h-1.5"
                />

                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="icon" disabled={isUILocked}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    className="p-5"
                    onClick={togglePlayback}
                    disabled={isUILocked}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <Button variant="outline" size="icon" disabled={isUILocked}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
