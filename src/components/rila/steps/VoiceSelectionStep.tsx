import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface VoiceSelectionProps {
  onGenerateAudio: (voiceSettings: {
    voiceId: string;
    customVoiceId?: string;
    isAdvanced: boolean;
  }) => void;
  onEditScript: () => void;
}

export function VoiceSelectionStep({
  onGenerateAudio,
  onEditScript,
}: VoiceSelectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("default-female");
  const [customVoiceId, setCustomVoiceId] = useState("");
  const [advancedVoice, setAdvancedVoice] = useState("11labs-soothing-female");

  const handleGenerateAudio = () => {
    onGenerateAudio({
      voiceId: showAdvanced ? advancedVoice : selectedVoice,
      customVoiceId: showAdvanced ? customVoiceId : undefined,
      isAdvanced: showAdvanced,
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <h1 className="text-2xl font-medium">Choose a Voice</h1>

      {!showAdvanced ? (
        <div className="space-y-4">
          <div>
            <p className="text-lg mb-2">Select a default voice:</p>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default-female">
                  Default English Female
                </SelectItem>
                <SelectItem value="default-male">
                  Default English Male
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" onClick={onEditScript} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Edit Script
            </Button>
            <Button onClick={handleGenerateAudio}>Next: Generate Audio</Button>
            <Button variant="outline" onClick={() => setShowAdvanced(true)}>
              Show Advanced Options
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl">Advanced Voice Options</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2">Choose from 11Labs or custom voice IDs:</p>
              <Select value={advancedVoice} onValueChange={setAdvancedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11labs-soothing-female">
                    11Labs - Soothing Female
                  </SelectItem>
                  <SelectItem value="11labs-calm-male">
                    11Labs - Calm Male
                  </SelectItem>
                  <SelectItem value="11labs-gentle-female">
                    11Labs - Gentle Female
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2">Or enter a custom voice ID:</p>
              <Input
                placeholder="Custom Voice ID (optional)"
                value={customVoiceId}
                onChange={(e) => setCustomVoiceId(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={onEditScript} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Edit Script
              </Button>
              <Button onClick={handleGenerateAudio}>Generate Audio</Button>
              <Button variant="outline" onClick={() => setShowAdvanced(false)}>
                Show Simple Options
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
