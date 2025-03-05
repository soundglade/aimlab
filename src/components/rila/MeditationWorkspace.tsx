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
  // State for voice settings
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

  // State for editing
  const [editMode, setEditMode] = useState(false);
  const [editableTexts, setEditableTexts] = useState<{ [key: number]: string }>(
    {}
  );
  const [editablePauseDurations, setEditablePauseDurations] = useState<{
    [key: number]: number;
  }>({});

  // State for playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State for sharing
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // State for voice selection
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

  // Audio preview functionality
  const { currentlyPlaying, previewSection } = useAudioPreview(
    meditation,
    fileStorage
  );

  // Synthesis functionality
  const {
    progress,
    error,
    isSynthesizing,
    isGeneratingFullAudio,
    handleCancel,
    startSynthesis,
  } = useSynthesis(
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

  // Update voice settings in session when they change
  const updateVoiceSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    if (onVoiceSettingsUpdate) {
      onVoiceSettingsUpdate(newSettings);
    }
  };

  // Initialize editable texts when meditation changes
  useEffect(() => {
    setEditableTexts(
      meditation.steps.reduce((acc, step, index) => {
        if (step.type === "speech" || step.type === "heading") {
          acc[index] = step.text;
        }
        return acc;
      }, {} as { [key: number]: string })
    );

    setEditablePauseDurations(
      meditation.steps.reduce((acc, step, index) => {
        if (step.type === "pause") {
          acc[index] = step.duration;
        }
        return acc;
      }, {} as { [key: number]: number })
    );
  }, [meditation]);

  // Load audio when meditation has a full audio file
  useEffect(() => {
    const loadAudio = async () => {
      if (meditation.fullAudioFileId) {
        try {
          const storedFile = await fileStorage.getFile(
            meditation.fullAudioFileId
          );
          if (storedFile && storedFile.data) {
            const url = createAudioUrl(storedFile.data, "audio/wav");
            setAudioUrl(url);

            // Create audio element
            const audio = new Audio(url);
            audioRef.current = audio;

            // Set up event listeners
            audio.addEventListener("timeupdate", () => {
              setCurrentTimeMs(audio.currentTime * 1000);
            });

            audio.addEventListener("ended", () => {
              setIsPlaying(false);
              setCurrentTimeMs(0);
            });
          }
        } catch (error) {
          console.error("Error loading audio:", error);
        }
      }
    };

    loadAudio();

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [meditation.fullAudioFileId, fileStorage]);

  // Handle text change in the input
  const handleTextChange = (index: number, text: string) => {
    setEditableTexts((prev) => ({
      ...prev,
      [index]: text,
    }));
  };

  // Handle pause duration change
  const handlePauseDurationChange = (index: number, duration: number) => {
    setEditablePauseDurations((prev) => ({
      ...prev,
      [index]: duration,
    }));
  };

  // Save edits
  const saveEdits = () => {
    const updatedSteps = [...meditation.steps];

    // Update text content
    Object.entries(editableTexts).forEach(([indexStr, text]) => {
      const index = parseInt(indexStr);
      if (
        updatedSteps[index].type === "speech" ||
        updatedSteps[index].type === "heading"
      ) {
        updatedSteps[index] = {
          ...updatedSteps[index],
          text,
        };
      }
    });

    // Update pause durations
    Object.entries(editablePauseDurations).forEach(([indexStr, duration]) => {
      const index = parseInt(indexStr);
      if (updatedSteps[index].type === "pause") {
        updatedSteps[index] = {
          ...updatedSteps[index],
          duration,
          durationMs: duration * 1000,
        };
      }
    });

    onMeditationUpdate({
      ...meditation,
      steps: updatedSteps,
    });

    setEditMode(false);
  };

  // Handle voice preset selection
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = VOICE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const newSettings = {
        ttsService: preset.ttsService,
        ttsSettings: preset.settings,
        isAdvancedMode: false,
      };
      updateVoiceSettings(newSettings);
    }
  };

  // Handle playback controls
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTimeMs(0);
    if (!isPlaying) {
      audioRef.current.play();
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
          const url = createAudioUrl(storedFile.data, "audio/wav");
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
      setShareUrl(response.shareUrl);
      setShareDialogOpen(true);
    } catch (error) {
      console.error("Error sharing meditation:", error);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle synthesis
  const handleStartSynthesis = () => {
    // Reset synthesis state
    onSynthesisStateUpdate({
      started: false,
      progress: 0,
      completedStepIndices: [],
    });

    // Start synthesis
    startSynthesis();
  };

  // Determine if synthesis is complete
  const isSynthesisComplete = meditation.fullAudioFileId !== undefined;

  // Determine if UI should be locked during synthesis
  const isUILocked = isSynthesizing || isGeneratingFullAudio;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar - Fixed */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left side - Meditation Title */}
            <div className="flex items-center">
              <h1 className="text-lg font-semibold truncate max-w-[200px] sm:max-w-xs">
                {meditation.title}
              </h1>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center gap-2">
              {!isUILocked && !editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  disabled={isUILocked}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}

              {!isUILocked && editMode && (
                <Button size="sm" onClick={saveEdits} disabled={isUILocked}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}

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

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="mx-auto max-w-3xl px-4 space-y-4">
          {meditation.steps.map((step, index) => {
            const status: StepStatus =
              synthesisState.completedStepIndices.includes(index)
                ? "complete"
                : currentlyPlaying === index
                ? "processing"
                : "pending";

            if (editMode) {
              // Editable view
              if (step.type === "heading") {
                return (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`heading-${index}`}>Heading</Label>
                    <Input
                      id={`heading-${index}`}
                      value={editableTexts[index] || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className={cn(
                        "font-medium",
                        step.level === 1 ? "text-xl" : "text-lg"
                      )}
                    />
                  </div>
                );
              } else if (step.type === "speech") {
                return (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`speech-${index}`}>Speech</Label>
                    <Textarea
                      id={`speech-${index}`}
                      value={editableTexts[index] || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                );
              } else if (step.type === "pause") {
                return (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`pause-${index}`}>
                      Pause Duration (seconds)
                    </Label>
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
                        className="flex-1"
                      />
                      <span className="w-12 text-right">
                        {editablePauseDurations[index] || 1}s
                      </span>
                    </div>
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
            } else {
              // Display view
              return (
                <MeditationStepDisplay
                  key={index}
                  section={step}
                  status={status}
                  onPreview={
                    step.type === "speech" &&
                    "audioFileId" in step &&
                    step.audioFileId
                      ? () => previewSection(index)
                      : undefined
                  }
                />
              );
            }
          })}
        </div>
      </div>

      {/* Bottom Navigation Bar - Fixed */}
      <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4">
          <div className="flex h-14 items-center justify-center">
            {isSynthesisComplete && audioUrl ? (
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
            ) : (
              <p className="text-sm text-muted-foreground">
                {isSynthesizing || isGeneratingFullAudio
                  ? "Generating audio..."
                  : "Generate audio to enable playback"}
              </p>
            )}
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
