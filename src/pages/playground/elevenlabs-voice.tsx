import { useState, useRef } from "react";
import PlaygroundLayout from "@/components/dashboard/PlaygroundLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ELEVENLABS_VOICE_CONFIG } from "@/lib/services/elevenlabs";

export default function ElevenLabsVoicePage() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [modelId, setModelId] = useState("");
  const [stability, setStability] = useState("");
  const [similarityBoost, setSimilarityBoost] = useState("");
  const [style, setStyle] = useState("");
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(false);
  const [speed, setSpeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const presetKey = e.target.value;
    setSelectedPreset(presetKey);
    if (presetKey && ELEVENLABS_VOICE_CONFIG[presetKey]) {
      const config = ELEVENLABS_VOICE_CONFIG[presetKey];
      setVoiceId(config.voice_id || "");
      setModelId(config.model_id || "");
      setSpeed(typeof config.speed === "number" ? String(config.speed) : "");
      setStability(
        typeof config.stability === "number" ? String(config.stability) : ""
      );
      setSimilarityBoost(
        typeof config.similarity_boost === "number"
          ? String(config.similarity_boost)
          : ""
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/playground/elevenlabs-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          model_id: modelId,
          stability: stability ? Number(stability) : undefined,
          similarity_boost: similarityBoost
            ? Number(similarityBoost)
            : undefined,
          style: style ? Number(style) : undefined,
          use_speaker_boost: useSpeakerBoost,
          speed: speed ? Number(speed) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlaygroundLayout>
      <h1 className="mb-4 text-2xl">ElevenLabs Voice Playground</h1>
      <form className="max-w-lg space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="preset">Load Preset</Label>
          <select
            id="preset"
            className="w-full rounded border px-2 py-1"
            value={selectedPreset}
            onChange={handlePresetChange}
          >
            <option value="">Select a preset...</option>
            {Object.entries(ELEVENLABS_VOICE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="text">Text</Label>
          <Textarea
            id="text"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="voiceId">Voice ID</Label>
          <Input
            id="voiceId"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelId">Model ID</Label>
          <Input
            id="modelId"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stability">Stability</Label>
          <Input
            id="stability"
            type="number"
            step="any"
            value={stability}
            onChange={(e) => setStability(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="similarityBoost">Similarity Boost</Label>
          <Input
            id="similarityBoost"
            type="number"
            step="any"
            value={similarityBoost}
            onChange={(e) => setSimilarityBoost(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="style">Style</Label>
          <Input
            id="style"
            type="number"
            step="any"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
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
        <div className="space-y-2">
          <Label htmlFor="speed">Speed (0.7–1.2)</Label>
          <Input
            id="speed"
            type="number"
            step="any"
            min="0.7"
            max="1.2"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            placeholder="Optional"
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate & Play"}
        </Button>
      </form>
      <audio ref={audioRef} controls className="mt-6 w-full" />
    </PlaygroundLayout>
  );
}
