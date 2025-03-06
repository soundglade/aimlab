import { useState, useEffect } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Meditation, SynthesisState } from "./Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { VoiceSettings, TtsPreset } from "./steps/voice/ttsTypes";
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

// Jotai atoms for shared state
export const meditationAtom = atom<Meditation | null>(null);
export const voiceSettingsAtom = atom<VoiceSettings>({
  ttsService: "kokoro",
  ttsSettings: {
    model: "web",
    voiceId: "nicole",
    speed: 1.0,
  },
  isAdvancedMode: false,
});
export const selectedPresetAtom = atom<string>("meditation-default");
export const isPlayingAtom = atom<boolean>(false);
export const currentTimeMsAtom = atom<number>(0);
export const isSharingAtom = atom<boolean>(false);
export const editableTextsAtom = atom<Record<number, string>>({});
export const editablePauseDurationsAtom = atom<Record<number, number>>({});
export const editingStepIndexAtom = atom<number | null>(null);
export const editingTitleAtom = atom<boolean>(false);
export const selectedStepIndexAtom = atom<number | null>(null);
export const isUILockedAtom = atom<boolean>(false);
export const synthesisStateAtom = atom<SynthesisState>({
  started: false,
  progress: 0,
  completedStepIndices: [],
});
export const audioElementAtom = atom<HTMLAudioElement | null>(null);

// Derived atoms
export const isSynthesizingAtom = atom((get) => {
  const state = get(synthesisStateAtom);
  return state.started && state.progress < 100;
});

export const isGeneratingFullAudioAtom = atom((get) => {
  const state = get(synthesisStateAtom);
  return state.progress >= 90 && state.progress < 100;
});

export const isSynthesisCompleteAtom = atom((get) => {
  const state = get(synthesisStateAtom);
  return state.started && state.progress === 100;
});

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
  // Initialize atoms with props
  const [, setMeditationAtom] = useAtom(meditationAtom);
  const [voiceSettings, setVoiceSettings] = useAtom(voiceSettingsAtom);
  const [selectedPreset, setSelectedPreset] = useAtom(selectedPresetAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [currentTimeMs, setCurrentTimeMs] = useAtom(currentTimeMsAtom);
  const [isSharing, setIsSharing] = useAtom(isSharingAtom);
  const [editableTexts, setEditableTexts] = useAtom(editableTextsAtom);
  const [editablePauseDurations, setEditablePauseDurations] = useAtom(
    editablePauseDurationsAtom
  );
  const [editingStepIndex, setEditingStepIndex] = useAtom(editingStepIndexAtom);
  const [editingTitle, setEditingTitle] = useAtom(editingTitleAtom);
  const [selectedStepIndex, setSelectedStepIndex] = useAtom(
    selectedStepIndexAtom
  );
  const [, setSynthesisState] = useAtom(synthesisStateAtom);
  const [, setAudioElement] = useAtom(audioElementAtom);

  // Set derived atoms
  const isSynthesizing = useAtomValue(isSynthesizingAtom);
  const isGeneratingFullAudio = useAtomValue(isGeneratingFullAudioAtom);
  const isSynthesisComplete = useAtomValue(isSynthesisCompleteAtom);
  const setIsUILocked = useSetAtom(isUILockedAtom);

  // Compute isUILocked locally for use in this component
  const isUILocked = isSynthesizing || isGeneratingFullAudio;
  const progress = synthesisState.progress;

  // Local state (not shared with child components)
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Initialize atoms with props on mount
  useEffect(() => {
    setMeditationAtom(meditation);
    setSynthesisState(synthesisState);

    // Update UI locked state based on synthesis state
    setIsUILocked(
      (synthesisState.started && synthesisState.progress < 100) ||
        (synthesisState.progress >= 90 && synthesisState.progress < 100)
    );

    if (initialVoiceSettings) {
      setVoiceSettings(initialVoiceSettings);

      // Try to find a matching preset
      const matchingPreset = VOICE_PRESETS.find(
        (preset) =>
          preset.ttsService === initialVoiceSettings.ttsService &&
          preset.settings.voiceId === initialVoiceSettings.ttsSettings.voiceId
      );
      setSelectedPreset(matchingPreset?.id || "meditation-default");
    }
  }, []);

  // Update meditation atom when prop changes
  useEffect(() => {
    setMeditationAtom(meditation);
  }, [meditation]);

  // Update synthesis state atom when prop changes
  useEffect(() => {
    setSynthesisState(synthesisState);

    // Update UI locked state based on synthesis state
    setIsUILocked(
      (synthesisState.started && synthesisState.progress < 100) ||
        (synthesisState.progress >= 90 && synthesisState.progress < 100)
    );
  }, [synthesisState]);

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

  // Audio preview functionality
  const { previewSection } = useAudioPreview(meditation, fileStorage);

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <TopBar
        meditation={meditation}
        voicePresets={VOICE_PRESETS}
        onMeditationUpdate={onMeditationUpdate}
        onSynthesisStateUpdate={onSynthesisStateUpdate}
        onShareMeditation={onShareMeditation}
        fileStorage={fileStorage}
        sessionId={sessionId}
        onVoiceSettingsUpdate={onVoiceSettingsUpdate}
      />

      {/* Main Content */}
      <div
        className={`pt-14 ${
          isSynthesisComplete && audioUrl ? "pb-14" : "pb-4"
        }`}
      >
        <MeditationStepsList
          meditation={meditation}
          fileStorage={fileStorage}
          sessionId={sessionId}
          onMeditationUpdate={onMeditationUpdate}
          onSynthesisStateUpdate={onSynthesisStateUpdate}
          onPreviewSection={previewSection}
        />
      </div>

      {/* Bottom Playback Controls */}
      <BottomBar />

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
