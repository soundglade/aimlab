import { useState, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Share2, Settings2, Loader, PenSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Meditation, SynthesisState } from "../Rila";
import { VoiceSettings, TtsPreset } from "../steps/voice/ttsTypes";
import { createAudioUrl } from "../utils/audioUtils";
import { downloadAudioFile } from "../utils/audioExporter";
import { useSynthesis } from "../steps/synthesis/useSynthesis";
import {
  meditationAtom,
  voiceSettingsAtom,
  selectedPresetAtom,
  isSharingAtom,
  editingTitleAtom,
  isSynthesizingAtom,
  isGeneratingFullAudioAtom,
  isSynthesisCompleteAtom,
  isUILockedAtom,
  synthesisStateAtom,
  selectedStepIndexAtom,
  audioElementAtom,
  isPlayingAtom,
  currentTimeMsAtom,
} from "../MeditationWorkspace";

// Voice presets definition
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

interface TopBarProps {
  meditation: Meditation;
  onMeditationUpdate: (updatedMeditation: Meditation) => void;
  onSynthesisStateUpdate: (synthesisState: SynthesisState) => void;
  onShareMeditation: () => Promise<any>;
  fileStorage: any;
  sessionId?: string;
  onVoiceSettingsUpdate?: (voiceSettings: VoiceSettings) => void;
}

export function TopBar({
  meditation,
  onMeditationUpdate,
  onSynthesisStateUpdate,
  onShareMeditation,
  fileStorage,
  sessionId,
  onVoiceSettingsUpdate,
}: TopBarProps) {
  // Use atoms instead of props
  const [, setMeditationAtom] = useAtom(meditationAtom);
  const [voiceSettings, setVoiceSettings] = useAtom(voiceSettingsAtom);
  const [selectedPreset, setSelectedPreset] = useAtom(selectedPresetAtom);
  const [isSharing, setIsSharing] = useAtom(isSharingAtom);
  const [editingTitle, setEditingTitle] = useAtom(editingTitleAtom);
  const setSelectedStepIndex = useSetAtom(selectedStepIndexAtom);
  const [synthesisState, setSynthesisState] = useAtom(synthesisStateAtom);
  const [, setAudioElement] = useAtom(audioElementAtom);
  const [, setIsPlaying] = useAtom(isPlayingAtom);
  const [, setCurrentTimeMs] = useAtom(currentTimeMsAtom);

  // Read-only atoms
  const isUILocked = useAtomValue(isUILockedAtom);
  const isSynthesizing = useAtomValue(isSynthesizingAtom);
  const isGeneratingFullAudio = useAtomValue(isGeneratingFullAudioAtom);
  const isSynthesisComplete = useAtomValue(isSynthesisCompleteAtom);
  const progress = synthesisState.progress;

  // Local state
  const [showAdvancedVoiceSettings, setShowAdvancedVoiceSettings] =
    useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Update meditation atom when prop changes
  useEffect(() => {
    setMeditationAtom(meditation);
  }, [meditation, setMeditationAtom]);

  // Initialize voice settings if needed
  useEffect(() => {
    // Try to find a matching preset based on current voice settings
    const matchingPreset = VOICE_PRESETS.find(
      (preset) =>
        preset.ttsService === voiceSettings.ttsService &&
        preset.settings.voiceId === voiceSettings.ttsSettings.voiceId
    );

    if (!matchingPreset) {
      // If no matching preset, set to default
      setSelectedPreset("meditation-default");
    }
  }, [voiceSettings, setSelectedPreset]);

  // Load audio when synthesis is complete
  useEffect(() => {
    const loadAudio = async () => {
      if (meditation.fullAudioFileId && !audioUrl) {
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
  }, [
    meditation.fullAudioFileId,
    fileStorage,
    audioUrl,
    setAudioElement,
    setCurrentTimeMs,
    setIsPlaying,
  ]);

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

  // Update voice settings
  const updateVoiceSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    if (onVoiceSettingsUpdate) {
      onVoiceSettingsUpdate(newSettings);
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

  // Start editing the title
  const startEditingTitle = () => {
    if (isUILocked) return;
    setEditingTitle(true);
    // Clear selection when editing title
    setSelectedStepIndex(null);
  };

  // Finish editing and save changes
  const finishEditing = () => {
    setEditingTitle(false);
  };

  return (
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
                onBlur={finishEditing}
                autoFocus
                className="font-semibold text-lg border-none focus-visible:ring-0 p-0 max-w-[200px] sm:max-w-xs"
                disabled={isUILocked}
              />
            ) : (
              <div
                className="group relative cursor-pointer font-semibold text-lg truncate max-w-[200px] sm:max-w-xs"
                onClick={startEditingTitle}
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
              <div className="text-sm font-medium">{Math.round(progress)}%</div>
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
  );
}
