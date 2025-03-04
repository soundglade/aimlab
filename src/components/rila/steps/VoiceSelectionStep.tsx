import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import TTS services and types
import { VoiceSettings } from "./voice/ttsTypes";
import { KOKORO_SERVICE } from "./voice/KokoroSettings";
import { ELEVENLABS_SERVICE } from "./voice/ElevenLabsSettings";
import { AdvancedVoiceSettings } from "./voice/AdvancedVoiceSettings";

// Collection of all available TTS services
const TTS_SERVICES = [KOKORO_SERVICE, ELEVENLABS_SERVICE];

interface VoiceSelectionProps {
  voiceSettings?: VoiceSettings;
  onGenerateAudio: (voiceSettings: VoiceSettings) => void;
  onEditScript: () => void;
  previewText?: string;
}

export function VoiceSelectionStep({
  voiceSettings,
  onGenerateAudio,
  onEditScript,
  previewText,
}: VoiceSelectionProps) {
  // Default to Kokoro TTS
  const defaultSettings: VoiceSettings = {
    ttsService: KOKORO_SERVICE.id,
    ttsSettings: KOKORO_SERVICE.defaultSettings,
    isAdvancedMode: false,
  };

  // State
  const [settings, setSettings] = useState<VoiceSettings>(
    voiceSettings || defaultSettings
  );
  const [isAdvancedMode, setIsAdvancedMode] = useState(settings.isAdvancedMode);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [previewTextInput, setPreviewTextInput] = useState(
    previewText ||
      TTS_SERVICES.find((s) => s.id === settings.ttsService)
        ?.defaultPreviewText ||
      KOKORO_SERVICE.defaultPreviewText
  );

  // Update state if props change
  useEffect(() => {
    if (voiceSettings) {
      setSettings(voiceSettings);
      setIsAdvancedMode(voiceSettings.isAdvancedMode);

      // Find matching preset for simple mode
      if (
        !voiceSettings.isAdvancedMode &&
        voiceSettings.ttsService === KOKORO_SERVICE.id
      ) {
        const presetIndex = KOKORO_SERVICE.presets.findIndex((preset) => {
          const presetVoiceId = preset.settings.voiceId;
          const currentVoiceId = voiceSettings.ttsSettings.voiceId;
          return presetVoiceId === currentVoiceId;
        });

        if (presetIndex !== -1) {
          setSelectedPreset(presetIndex);
        }
      }
    }
  }, [voiceSettings]);

  // Toggle between simple and advanced modes
  const handleModeToggle = (advanced: boolean) => {
    setIsAdvancedMode(advanced);

    if (!advanced) {
      // Switch to Kokoro simple mode (always use Kokoro for simple mode)
      let bestPresetIndex = 0;

      // Try to find a matching preset if already using Kokoro
      if (settings.ttsService === KOKORO_SERVICE.id) {
        const matchingPreset = KOKORO_SERVICE.presets.findIndex(
          (p) => p.settings.voiceId === settings.ttsSettings.voiceId
        );
        if (matchingPreset !== -1) {
          bestPresetIndex = matchingPreset;
        }
      }

      setSelectedPreset(bestPresetIndex);
      setSettings({
        ttsService: KOKORO_SERVICE.id,
        ttsSettings: KOKORO_SERVICE.presets[bestPresetIndex].settings,
        isAdvancedMode: false,
      });
    } else {
      // Just update the mode flag when switching to advanced
      setSettings((prev) => ({
        ...prev,
        isAdvancedMode: true,
      }));
    }
  };

  // Handle preset selection in simple mode
  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setSettings({
      ttsService: KOKORO_SERVICE.id,
      ttsSettings: KOKORO_SERVICE.presets[index].settings,
      isAdvancedMode: false,
    });
  };

  return (
    <>
      <h1 className="text-2xl font-medium text-center">Choose a Voice</h1>
      <Card className="p-6 space-y-6">
        <div className="space-y-6">
          {/* Mode Toggle - Conditional UI */}
          <div className="flex justify-end">
            {isAdvancedMode ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModeToggle(false)}
                >
                  Simple Options
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleModeToggle(true)}
                className="flex items-center gap-1"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Advanced Options
              </Button>
            )}
          </div>

          {!isAdvancedMode ? (
            // Simple Mode - Preset Voice Options (always Kokoro)
            <div className="space-y-6">
              <div>
                <RadioGroup
                  value={String(selectedPreset)}
                  onValueChange={(value) => handlePresetChange(parseInt(value))}
                  className="space-y-4"
                >
                  {KOKORO_SERVICE.presets.map((preset, index) => (
                    <div key={preset.id} className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={String(index)}
                        id={preset.id}
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label
                          htmlFor={preset.id}
                          className="text-base font-medium cursor-pointer"
                        >
                          {preset.name}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {preset.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log("Playing preview with preset:", {
                              ttsService: KOKORO_SERVICE.id,
                              ttsSettings: preset.settings,
                            });
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          ) : (
            // Advanced Mode - Now using the separate component
            <AdvancedVoiceSettings
              settings={settings}
              previewTextInput={previewTextInput}
              setPreviewTextInput={setPreviewTextInput}
              onSettingsChange={setSettings}
            />
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-2 justify-center">
        <Button variant="outline" onClick={onEditScript} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Edit Script
        </Button>
        <Button onClick={() => onGenerateAudio(settings)}>
          Next: Generate Audio
        </Button>
      </div>
    </>
  );
}
