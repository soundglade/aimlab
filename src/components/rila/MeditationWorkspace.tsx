import { useEffect } from "react";
import { atom, useAtom, useAtomValue } from "jotai";
import { Meditation, SynthesisState } from "./Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { VoiceSettings, TtsPreset } from "./steps/voice/ttsTypes";
import { ShareResponse } from "./utils/shareService";
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
  // Use atoms for state management
  const [, setMeditationAtom] = useAtom(meditationAtom);
  const [, setSynthesisState] = useAtom(synthesisStateAtom);
  const [, setIsUILocked] = useAtom(isUILockedAtom);
  const [, setVoiceSettings] = useAtom(voiceSettingsAtom);
  const [, setSelectedPreset] = useAtom(selectedPresetAtom);

  // Read-only atoms
  const isSynthesisComplete = useAtomValue(isSynthesisCompleteAtom);

  // Set derived atoms
  const isSynthesizing = useAtomValue(isSynthesizingAtom);
  const isGeneratingFullAudio = useAtomValue(isGeneratingFullAudioAtom);

  // Compute isUILocked locally for use in this component
  const isUILocked = isSynthesizing || isGeneratingFullAudio;

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
  }, [
    meditation,
    synthesisState,
    initialVoiceSettings,
    setMeditationAtom,
    setSynthesisState,
    setIsUILocked,
    setVoiceSettings,
    setSelectedPreset,
  ]);

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
          isSynthesisComplete && meditation.fullAudioFileId ? "pb-14" : "pb-4"
        }`}
      >
        <MeditationStepsList
          meditation={meditation}
          fileStorage={fileStorage}
          sessionId={sessionId}
          onMeditationUpdate={onMeditationUpdate}
          onSynthesisStateUpdate={onSynthesisStateUpdate}
        />
      </div>

      {/* Bottom Playback Controls */}
      <BottomBar />
    </div>
  );
}
