import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useLocalStorage } from "@rehooks/local-storage";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { ScrollArea } from "@/components/ui/scroll-area";

type ElevenLabsSettings = {
  service: "elevenlabs";
  serviceOptions: {
    api_key: string;
    voice_id: string;
    model_id: string;
    speed?: number;
    stability?: number;
    similarity_boost?: number;
    use_speaker_boost?: boolean;
  };
};

export default function CustomizeDrawer() {
  const [open, setOpen] = useState(false);
  const [storedSettings, setStoredSettings] =
    useLocalStorage<ElevenLabsSettings | null>("custom-voice-settings", null);
  const [pauseMultiplier, setPauseMultiplier] =
    useLocalStorage<number>("explicit-pause-multiplier", 1);
  const [apiKey, setApiKey] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [modelId, setModelId] = useState("");
  const [speed, setSpeed] = useState("");
  const [stability, setStability] = useState("");
  const [similarityBoost, setSimilarityBoost] = useState("");
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setApiKey(storedSettings?.serviceOptions.api_key || "");
      setVoiceId(storedSettings?.serviceOptions.voice_id || "");
      setModelId(storedSettings?.serviceOptions.model_id || "");
      setSpeed(
        storedSettings?.serviceOptions.speed !== undefined
          ? String(storedSettings.serviceOptions.speed)
          : ""
      );
      setStability(
        storedSettings?.serviceOptions.stability !== undefined
          ? String(storedSettings.serviceOptions.stability)
          : ""
      );
      setSimilarityBoost(
        storedSettings?.serviceOptions.similarity_boost !== undefined
          ? String(storedSettings.serviceOptions.similarity_boost)
          : ""
      );
      setUseSpeakerBoost(!!storedSettings?.serviceOptions.use_speaker_boost);
    }
  }, [open]);

  useEffect(() => {
    // On mount: check for 'settings' param in URL
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("settings");
    if (encoded) {
      try {
        // Decode base64 to JSON string
        const json = decodeURIComponent(escape(atob(encoded)));
        const parsed = JSON.parse(json);
        setStoredSettings(parsed);
      } catch (e) {
        // Optionally, you could show a toast here for invalid param
      }
      // Remove 'settings' param from URL and reload the page
      params.delete("settings");
      const newUrl = `${window.location.origin}${window.location.pathname}${
        params.toString() ? "?" + params.toString() : ""
      }`;
      window.location.replace(newUrl); // This will reload the page
    }
  }, []);

  function handleCancel() {
    setOpen(false);
  }

  function handleSave() {
    setStoredSettings({
      service: "elevenlabs",
      serviceOptions: {
        api_key: apiKey,
        voice_id: voiceId,
        model_id: modelId,
        speed: speed !== "" ? Number(speed) : undefined,
        stability: stability !== "" ? Number(stability) : undefined,
        similarity_boost:
          similarityBoost !== "" ? Number(similarityBoost) : undefined,
        use_speaker_boost: useSpeakerBoost,
      },
    });
    setOpen(false);
  }

  function handleReset() {
    setStoredSettings(null);
    setOpen(false);
  }

  async function handleCopyAsUrl() {
    try {
      const settings = {
        service: "elevenlabs",
        serviceOptions: {
          api_key: apiKey,
          voice_id: voiceId,
          model_id: modelId,
          speed: speed !== "" ? Number(speed) : undefined,
          stability: stability !== "" ? Number(stability) : undefined,
          similarity_boost:
            similarityBoost !== "" ? Number(similarityBoost) : undefined,
          use_speaker_boost: useSpeakerBoost,
        },
      };
      const json = JSON.stringify(settings);
      // btoa only works with ASCII, so encodeURIComponent is used for safety
      const base64 = btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}${window.location.pathname}?settings=${base64}`;
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy URL");
    }
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
        <DrawerContent className="w-[350px]!">
          <ScrollArea className="h-full p-2">
            <div className="p-2">
              {/* Playback Settings */}
              <div className="mb-6">
                <h2 className="mb-1 text-xl tracking-tight">
                  Pause length
                </h2>
                <p className="mb-4 text-sm text-gray-500">
                  Prolong or shorten pauses in playback and downloads. The times shown below reflect the adjusted pause length.
                </p>
                <Label htmlFor="pauseMultiplier" className="mb-1 block text-xs">
                  Pause length: {(pauseMultiplier ?? 1).toFixed(1)}×
                </Label>
                <input
                  id="pauseMultiplier"
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.1}
                  list="pauseMultiplierOptions"
                  value={pauseMultiplier ?? 1}
                  onChange={(e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    const allowed = [0.5, 1, 1.5, 2, 3];
                    const snapped = allowed.reduce((prev, curr) =>
                      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev,
                      allowed[0]
                    );
                    setPauseMultiplier(snapped);
                  }}
                  className="w-full"
                />
                <datalist id="pauseMultiplierOptions">
                  <option value="0.5" />
                  <option value="1" />
                  <option value="1.5" />
                  <option value="2" />
                  <option value="3" />
                </datalist>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Fast 0.5×</span>
                  <span>Normal 1.0×</span>
                  <span>1.5×</span>
                  <span>Slow 2.0×</span>
                  <span>Extra Slow 3.0×</span>
                </div>
              </div>
              <h2 className="mb-1 text-xl tracking-tight">
                Custom Voice Settings
              </h2>
              <p className="mb-4 text-sm text-gray-500">
                You can customize the voice settings by using ElevenLabs. You
                need to have an account with them and an API key.
              </p>
              <form
                className="space-y-4 md:mt-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div>
                  <Label htmlFor="apiKey" className="mb-1 block text-xs">
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
                  <Label htmlFor="voiceId" className="mb-1 block text-xs">
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
                  <Label htmlFor="modelId" className="mb-1 block text-xs">
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
                  <Label htmlFor="speed" className="mb-1 block text-xs">
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
                  <Label htmlFor="stability" className="mb-1 block text-xs">
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
                  <Label
                    htmlFor="similarityBoost"
                    className="mb-2 block text-xs"
                  >
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
                <div className="mt-6 flex flex-col gap-2 pt-2 md:mt-10">
                  <div className="flex items-center justify-around gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAsUrl}
                      className="flex-1"
                      disabled={!apiKey}
                    >
                      Copy as URL
                    </Button>
                  </div>
                  <div className="flex gap-2">
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
                </div>
              </form>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}
