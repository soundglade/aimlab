import React, { useRef, useState } from "react";
import { useAtom } from "jotai";
import { voiceIdAtom } from "./atoms";
import { Button } from "@/components/ui/button";
import { Speech, Pause, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Voice configuration
export const VOICES = [
  {
    id: "drew",
    name: "Drew",
    description: "ElevenLabs v1",
    previewFile: "/assets/drew-elevenlabs-voice-sample.mp3",
  },
  {
    id: "nicole",
    name: "Nicole",
    description: "Kokoro TTS",
    previewFile: "/assets/nicole-kokoro-voice-sample.mp3",
  },
  {
    id: "jameson",
    name: "Jameson",
    description: "ElevenLabs v2",
    previewFile: "/assets/jameson-elevenlabs-voice-sample.mp3",
  },
  {
    id: "britney",
    name: "Britney",
    description: "ElevenLabs v2",
    previewFile: "/assets/britney-elevenlabs-voice-sample.mp3",
  },
];

interface VoiceSelectionProps {
  isDisabled?: boolean;
}

const VoiceSelection = ({ isDisabled = false }: VoiceSelectionProps) => {
  const [voiceId, setVoiceId] = useAtom(voiceIdAtom);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio when component unmounts
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayVoice = (voiceId: string, previewFile: string) => {
    const isCurrentlyPlaying = playingVoiceId === voiceId;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If already playing this voice, just stop it
    if (isCurrentlyPlaying) {
      setPlayingVoiceId(null);
      return;
    }

    // Play the selected voice
    const audio = new Audio(previewFile);
    audio.onended = () => setPlayingVoiceId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingVoiceId(voiceId);
  };

  const handleSelectVoice = (selectedVoiceId: string) => {
    setVoiceId(selectedVoiceId);
  };

  return (
    <div>
      <label className="mb-2 block">Voice Selection</label>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        {VOICES.map((voice) => {
          const isSelected = voice.id === voiceId;

          return (
            <TooltipProvider key={voice.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center space-x-2 rounded-md border p-2 transition-colors ${
                      !isDisabled ? "cursor-pointer" : ""
                    }
                      ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "bg-card hover:bg-accent/50"
                      }`}
                    onClick={() => !isDisabled && handleSelectVoice(voice.id)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 flex-shrink-0 p-0"
                      disabled={isDisabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoice(voice.id, voice.previewFile);
                      }}
                    >
                      {playingVoiceId === voice.id ? (
                        <Pause className="text-primary h-4 w-4" />
                      ) : (
                        <Speech className="text-primary h-4 w-4" />
                      )}
                    </Button>

                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${
                            isSelected ? "text-primary" : ""
                          }`}
                        >
                          {voice.name}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="text-primary mr-1 h-4 w-4" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{voice.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default VoiceSelection;
