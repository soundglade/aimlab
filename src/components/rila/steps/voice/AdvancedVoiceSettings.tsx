import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { VoiceSettings } from "./ttsTypes";
import { KokoroSettingsSelection, KOKORO_SERVICE } from "./KokoroSettings";
import {
  ElevenLabsSettingsSelection,
  ELEVENLABS_SERVICE,
} from "./ElevenLabsSettings";

// Collection of all available TTS services
const TTS_SERVICES = [KOKORO_SERVICE, ELEVENLABS_SERVICE];

export interface AdvancedVoiceSettingsProps {
  settings: VoiceSettings;
  previewTextInput: string;
  setPreviewTextInput: (text: string) => void;
  onSettingsChange: (newSettings: VoiceSettings) => void;
}

export function AdvancedVoiceSettings({
  settings,
  previewTextInput,
  setPreviewTextInput,
  onSettingsChange,
}: AdvancedVoiceSettingsProps) {
  // Handle TTS service change in advanced mode
  const handleTtsServiceChange = (serviceId: string) => {
    const newService =
      TTS_SERVICES.find((s) => s.id === serviceId) || TTS_SERVICES[0];

    onSettingsChange({
      ttsService: newService.id,
      ttsSettings: newService.defaultSettings,
      isAdvancedMode: true,
    });
  };

  // Handle preview playback
  const handlePlayPreview = () => {
    // In a real implementation, this would call an API to generate/play the preview
    console.log(
      "Playing preview with settings:",
      settings,
      "and text:",
      previewTextInput
    );
  };

  // Render the appropriate TTS settings component
  const renderTtsSettings = () => {
    if (settings.ttsService === KOKORO_SERVICE.id) {
      return (
        <KokoroSettingsSelection
          settings={settings.ttsSettings}
          onChange={(newSettings) =>
            onSettingsChange({
              ...settings,
              ttsSettings: newSettings,
            })
          }
        />
      );
    } else if (settings.ttsService === ELEVENLABS_SERVICE.id) {
      return (
        <ElevenLabsSettingsSelection
          settings={settings.ttsSettings}
          onChange={(newSettings) =>
            onSettingsChange({
              ...settings,
              ttsSettings: newSettings,
            })
          }
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* TTS Service Selection */}
      <Tabs
        defaultValue={KOKORO_SERVICE.id}
        value={settings.ttsService}
        onValueChange={handleTtsServiceChange}
      >
        <TabsList className="mb-4">
          {TTS_SERVICES.map((service) => (
            <TabsTrigger key={service.id} value={service.id}>
              {service.displayName}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Dynamically render the appropriate service settings */}
        {TTS_SERVICES.map((service) => (
          <TabsContent
            key={service.id}
            value={service.id}
            className="space-y-6"
          >
            {settings.ttsService === service.id && renderTtsSettings()}
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview Text Area */}
      <div>
        <p className="text-base mb-2">Preview Text:</p>
        <Textarea
          placeholder="Enter text to preview"
          value={previewTextInput}
          onChange={(e) => setPreviewTextInput(e.target.value)}
          rows={3}
        />
        <Button variant="outline" className="mt-2" onClick={handlePlayPreview}>
          <Play className="h-4 w-4 mr-1" />
          Play Preview
        </Button>
      </div>
    </div>
  );
}
