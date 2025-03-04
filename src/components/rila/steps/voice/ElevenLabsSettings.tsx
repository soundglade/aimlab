import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TtsServiceConfig } from "./ttsTypes";

// ElevenLabs-specific types
export interface ElevenLabsSettings {
  voiceId: string;
  prosody?: string;
  customVoiceId?: string;
}

interface ElevenLabsSettingsProps {
  settings: ElevenLabsSettings;
  onChange: (settings: ElevenLabsSettings) => void;
}

// ElevenLabs voices data
const elevenLabsVoices = [
  {
    id: "11labs-soothing-female",
    name: "Soothing Female",
    gender: "female",
    accent: "american",
    description: "A gentle, soothing female voice",
  },
  {
    id: "11labs-calm-male",
    name: "Calm Male",
    gender: "male",
    accent: "american",
    description: "A calm, balanced male voice",
  },
  {
    id: "11labs-gentle-female",
    name: "Gentle Female",
    gender: "female",
    accent: "british",
    description: "A soft, gentle British female voice",
  },
];

// ElevenLabs service configuration
export const ELEVENLABS_SERVICE: TtsServiceConfig = {
  id: "elevenlabs",
  displayName: "ElevenLabs TTS",
  defaultPreviewText: "Close your eyes and focus on your breathing.",
  defaultSettings: {
    voiceId: "11labs-soothing-female",
    prosody: "normal",
  },
};

export function ElevenLabsSettingsSelection({
  settings,
  onChange,
}: ElevenLabsSettingsProps) {
  // Get details of the currently selected voice
  const currentVoice = elevenLabsVoices.find((v) => v.id === settings.voiceId);

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
            {elevenLabsVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name} - {voice.gender}, {voice.accent}
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

      {/* Prosody Control */}
      <div>
        <p className="mb-2">Prosody (speaking style):</p>
        <Select
          value={settings.prosody || "normal"}
          onValueChange={(value) => onChange({ ...settings, prosody: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="relaxed">Relaxed</SelectItem>
            <SelectItem value="expressive">Expressive</SelectItem>
            <SelectItem value="whispered">Whispered</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Controls the emotional tone and rhythm of the voice
        </p>
      </div>

      {/* Custom Voice ID */}
      <div>
        <p className="mb-2">Custom Voice ID (optional):</p>
        <Input
          placeholder="Enter your custom voice ID"
          value={settings.customVoiceId || ""}
          onChange={(e) =>
            onChange({
              ...settings,
              customVoiceId: e.target.value || undefined,
            })
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          For users with custom voices on ElevenLabs
        </p>
      </div>
    </div>
  );
}
