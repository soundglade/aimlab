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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Kokoro-specific types
export interface KokoroSettings {
  voiceId: string;
  speed: number;
  model: "web" | "api";
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

// Kokoro models data
const kokoroModels = [
  {
    id: "web",
    name: "Web",
    description: "Best for development (runs directly in the browser)",
  },
  {
    id: "api",
    name: "API",
    description: "Best for production (runs on our servers)",
  },
];

// Kokoro service configuration
export const KOKORO_SERVICE: TtsServiceConfig = {
  id: "kokoro",
  displayName: "Kokoro",
  defaultPreviewText: "Take a deep breath and relax your mind.",
  defaultSettings: {
    voiceId: "nicole",
    speed: 1.0,
    model: "web",
  },
};

export function KokoroSettingsSelection({
  settings,
  onChange,
}: KokoroSettingsProps) {
  // Get details of the currently selected voice
  const currentVoice = kokoroVoices.find((v) => v.id === settings.voiceId);

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div>
        <Label className="mb-2 block">Model:</Label>
        <RadioGroup
          value={settings.model}
          onValueChange={(value) =>
            onChange({ ...settings, model: value as "web" | "api" })
          }
          className="flex space-x-4"
        >
          {kokoroModels.map((model) => (
            <label
              key={model.id}
              htmlFor={`model-${model.id}`}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted transition-colors">
                <RadioGroupItem
                  className="mt-1"
                  value={model.id}
                  id={`model-${model.id}`}
                />
                <div className="grid ml-1 gap-0.5">
                  <span className="text-sm font-medium">{model.name}</span>
                  <p className="text-sm text-muted-foreground">
                    {model.description}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="mb-2 block">Voice:</Label>
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
          <Label className="mb-2 block">Speed:</Label>
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
