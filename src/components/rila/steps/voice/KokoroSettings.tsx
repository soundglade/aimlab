import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TtsServiceConfig } from "./ttsTypes";

// Kokoro-specific types
export interface KokoroSettings {
  voiceId: string;
  speed: number;
}

interface KokoroSettingsProps {
  settings: KokoroSettings;
  onChange: (settings: KokoroSettings) => void;
}

// Kokoro voices data
const kokoroVoices = [
  {
    id: "nicole",
    name: "Nicole",
    gender: "female",
    accent: "american",
    specialQualities: ["whispering"],
    description: "A calming, whispering voice perfect for meditation",
  },
  {
    id: "bella",
    name: "Bella",
    gender: "female",
    accent: "american",
    specialQualities: ["passionate"],
    description: "A passionate, warm voice with emotional resonance",
  },
  {
    id: "james",
    name: "James",
    gender: "male",
    accent: "british",
    description: "A soothing British male voice with clarity and depth",
  },
  {
    id: "emma",
    name: "Emma",
    gender: "female",
    accent: "british",
    description: "A gentle British female voice with soft tones",
  },
  {
    id: "david",
    name: "David",
    gender: "male",
    accent: "american",
    description: "A deep, calming American male voice",
  },
];

// Kokoro service configuration
export const KOKORO_SERVICE: TtsServiceConfig = {
  id: "kokoro",
  displayName: "Kokoro TTS",
  defaultPreviewText: "Take a deep breath and relax your mind.",
  defaultSettings: {
    voiceId: "nicole",
    speed: 1.0,
  },
  presets: [
    {
      id: "meditation-default",
      name: "Meditation Default",
      description: "Nicole's whispering voice at a gentle pace",
      settings: {
        voiceId: "nicole",
        speed: 1.0,
      },
    },
    {
      id: "guided-relaxation",
      name: "Guided Relaxation",
      description: "James's soothing British voice at a slower pace",
      settings: {
        voiceId: "james",
        speed: 0.8,
      },
    },
    {
      id: "energetic-meditation",
      name: "Energetic Meditation",
      description: "Bella's passionate voice at a moderate pace",
      settings: {
        voiceId: "bella",
        speed: 1.2,
      },
    },
  ],
};

export function KokoroSettingsSelection({
  settings,
  onChange,
}: KokoroSettingsProps) {
  // Get details of the currently selected voice
  const currentVoice = kokoroVoices.find((v) => v.id === settings.voiceId);

  return (
    <div className="space-y-6">
      <div>
        <Select
          value={settings.voiceId}
          onValueChange={(id) => onChange({ ...settings, voiceId: id })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {kokoroVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name} - {voice.gender}, {voice.accent}
                {voice.specialQualities?.length
                  ? ` (${voice.specialQualities.join(", ")})`
                  : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentVoice && (
          <p className="text-sm text-muted-foreground mt-1">
            {currentVoice.description}
          </p>
        )}
      </div>

      {/* Speed Control */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-base">Speed:</p>
          <p className="text-sm">{settings.speed.toFixed(1)}x</p>
        </div>
        <Slider
          min={0.5}
          max={1.5}
          step={0.1}
          value={[settings.speed]}
          onValueChange={(value) => onChange({ ...settings, speed: value[0] })}
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Slower (0.5x)</span>
          <span>Normal (1.0x)</span>
          <span>Faster (1.5x)</span>
        </div>
      </div>
    </div>
  );
}
