import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useLocalStorage } from "@rehooks/local-storage";

interface CustomVoiceSettings {
  apiKey: string;
  voiceId: string;
  modelId: string;
  speed: string;
  stability: string;
  similarityBoost: string;
  useSpeakerBoost: boolean;
}

export default function CustomizeDrawer() {
  const [open, setOpen] = useState(false);
  const [storedSettings, setStoredSettings] =
    useLocalStorage<CustomVoiceSettings | null>("custom-voice-settings", null);
  const [apiKey, setApiKey] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [modelId, setModelId] = useState("");
  const [speed, setSpeed] = useState("");
  const [stability, setStability] = useState("");
  const [similarityBoost, setSimilarityBoost] = useState("");
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(false);

  useEffect(() => {
    if (open && storedSettings) {
      setApiKey(storedSettings.apiKey || "");
      setVoiceId(storedSettings.voiceId || "");
      setModelId(storedSettings.modelId || "");
      setSpeed(storedSettings.speed || "");
      setStability(storedSettings.stability || "");
      setSimilarityBoost(storedSettings.similarityBoost || "");
      setUseSpeakerBoost(!!storedSettings.useSpeakerBoost);
    }
  }, [open, storedSettings]);

  function handleCancel() {
    setOpen(false);
  }

  function handleSave() {
    setStoredSettings({
      apiKey,
      voiceId,
      modelId,
      speed,
      stability,
      similarityBoost,
      useSpeakerBoost,
    });
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="outline"
        className="justify-between border-0"
        onClick={() => setOpen(true)}
      >
        <Settings className="opacity-50" />
        Customize
      </Button>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="w-[350px]! p-6">
          <h2 className="mb-4 text-xl font-semibold">Custom Voice Settings</h2>
          <p className="mb-4 text-sm text-gray-500">
            You can customize the voice settings by using ElevenLabs. You need
            to have an account with them and an API key.
          </p>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div>
              <Label htmlFor="apiKey" className="mb-2 block">
                API Key
              </Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your ElevenLabs API key"
                required
              />
            </div>
            <div>
              <Label htmlFor="voiceId" className="mb-2 block">
                Voice ID
              </Label>
              <Input
                id="voiceId"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                placeholder="Voice ID"
              />
            </div>
            <div>
              <Label htmlFor="modelId" className="mb-2 block">
                Model ID
              </Label>
              <Input
                id="modelId"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="Model ID"
              />
            </div>
            <div>
              <Label htmlFor="speed" className="mb-2 block">
                Speed
              </Label>
              <Input
                id="speed"
                type="number"
                step="any"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="stability" className="mb-2 block">
                Stability
              </Label>
              <Input
                id="stability"
                type="number"
                step="any"
                value={stability}
                onChange={(e) => setStability(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="similarityBoost" className="mb-2 block">
                Similarity Boost
              </Label>
              <Input
                id="similarityBoost"
                type="number"
                step="any"
                value={similarityBoost}
                onChange={(e) => setSimilarityBoost(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="speakerBoost"
                checked={useSpeakerBoost}
                onCheckedChange={setUseSpeakerBoost}
              />
              <Label htmlFor="speakerBoost">Use Speaker Boost</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
