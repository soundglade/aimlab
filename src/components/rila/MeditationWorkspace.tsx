import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Meditation, SynthesisState } from "./Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { VoiceSettings, TtsPreset } from "./steps/voice/ttsTypes";
import { useSynthesis } from "./steps/synthesis/useSynthesis";
import { useAudioPreview } from "./steps/synthesis/MeditationStepDisplay";
import { createAudioUrl, getAudioBlob } from "./utils/audioUtils";
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
import { TopBar } from "./workspace/TopBar";
import { BottomBar } from "./workspace/BottomBar";
import { MeditationStepsList } from "./workspace/MeditationStepsList";

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

  // Audio playback state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Editable text state
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
  }, [meditation.fullAudioFileId, fileStorage, audioUrl]);

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

  // Handle step blur
  const handleStepBlur = (index: number) => {
    if (meditation.steps[index].type === "pause") {
      handlePauseDurationBlur(index);
    } else {
      handleTextBlur(index);
    }
    finishEditing();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <TopBar
        meditation={meditation}
        isUILocked={isUILocked}
        isSynthesizing={isSynthesizing}
        isGeneratingFullAudio={isGeneratingFullAudio}
        isSynthesisComplete={isSynthesisComplete}
        progress={progress}
        voiceSettings={voiceSettings}
        selectedPreset={selectedPreset}
        isSharing={isSharing}
        editingTitle={editingTitle}
        voicePresets={VOICE_PRESETS}
        onMeditationUpdate={onMeditationUpdate}
        onVoiceSettingsUpdate={updateVoiceSettings}
        onPresetChange={handlePresetChange}
        onStartSynthesis={handleStartSynthesis}
        onDownload={handleDownload}
        onShare={handleShare}
        onCancel={handleCancel}
        onStartEditingTitle={startEditingTitle}
        onFinishEditing={finishEditing}
      />

      {/* Main Content */}
      <div
        className={`pt-14 ${
          isSynthesisComplete && audioUrl ? "pb-14" : "pb-4"
        }`}
      >
        <MeditationStepsList
          meditation={meditation}
          editableTexts={editableTexts}
          editablePauseDurations={editablePauseDurations}
          editingStepIndex={editingStepIndex}
          selectedStepIndex={selectedStepIndex}
          isUILocked={isUILocked}
          onStartEditing={startEditing}
          onTextChange={handleTextChange}
          onPauseDurationChange={handlePauseDurationChange}
          onBlur={handleStepBlur}
          onPreviewSection={previewSection}
          onGenerateStepAudio={handleGenerateStepAudio}
          onSelectStep={setSelectedStepIndex}
          onContainerClick={handleContainerClick}
          isStepOutOfSync={isStepOutOfSync}
        />
      </div>

      {/* Bottom Playback Controls */}

      <BottomBar
        meditation={meditation}
        isPlaying={isPlaying}
        currentTimeMs={currentTimeMs}
        isUILocked={isUILocked}
        onTogglePlayback={togglePlayback}
      />

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
