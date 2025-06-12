import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pause, Speech } from "lucide-react";

interface Voice {
  id: string;
  name: string;
  description?: string;
  previewFile: string;
}

// Predefined voices for instant meditation
const VOICES: Voice[] = [
  {
    id: "grace",
    name: "Grace",
    previewFile: "/assets/grace-voice-sample.mp3",
  },
  {
    id: "kate",
    name: "Kate",
    previewFile: "/assets/kate-voice-sample.mp3",
  },
  {
    id: "emily",
    name: "Emily",
    previewFile: "/assets/emily-voice-sample.mp3",
  },
  {
    id: "ben",
    name: "Ben",
    previewFile: "/assets/ben-voice-sample.mp3",
  },
  {
    id: "matthew",
    name: "Matthew",
    previewFile: "/assets/matthew-voice-sample.mp3",
  },
  {
    id: "james",
    name: "James",
    previewFile: "/assets/idris-voice-sample.mp3",
  },
];

interface VoiceSelectProps {
  value: string; // selectedVoiceId
  onChange: (voiceId: string) => void;
  disabled?: boolean;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function VoiceSelect({
  value,
  onChange,
  disabled = false,
}: VoiceSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const selectedVoice = VOICES.find((v) => v.id === value);
  const buttonLabel = selectedVoice
    ? `Voice: ${selectedVoice.name}`
    : "Select voice";

  const [playingVoiceId, setPlayingVoiceId] = React.useState<string | null>(
    null
  );
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  const handleSelect = (voiceId: string) => {
    if (disabled) return;
    onChange(voiceId);
    setOpen(false);
  };

  const button = (
    <Button
      variant="outline"
      className="justify-between border-0"
      disabled={disabled}
    >
      <Speech className="opacity-50" />
      {buttonLabel}
    </Button>
  );

  React.useEffect(() => {
    if (!open) {
      stopPreview();
    }
  }, [open]);

  React.useEffect(() => {
    return () => {
      stopPreview();
    };
  }, []);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{button}</PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="center">
          <VoiceList
            disabled={disabled}
            voices={VOICES}
            selectedVoiceId={value}
            playingVoiceId={playingVoiceId}
            onSelect={handleSelect}
            onPlay={(voiceId, previewFile) => {
              if (disabled) return;

              const isCurrentlyPlaying = playingVoiceId === voiceId;

              stopPreview();

              if (isCurrentlyPlaying) return;

              const audio = new Audio(previewFile);
              audio.onended = () => {
                setPlayingVoiceId(null);
                audioRef.current = null;
              };
              audio.play();
              audioRef.current = audio;
              setPlayingVoiceId(voiceId);
            }}
            setOpen={setOpen}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{button}</DrawerTrigger>
      <DrawerContent className="h-[calc(100%-40px)]">
        <div className="mt-4 border-t">
          <VoiceList
            disabled={disabled}
            voices={VOICES}
            selectedVoiceId={value}
            playingVoiceId={playingVoiceId}
            onSelect={handleSelect}
            onPlay={(voiceId, previewFile) => {
              if (disabled) return;
              const isCurrentlyPlaying = playingVoiceId === voiceId;
              stopPreview();
              if (isCurrentlyPlaying) return;
              const audio = new Audio(previewFile);
              audio.onended = () => {
                setPlayingVoiceId(null);
                audioRef.current = null;
              };
              audio.play();
              audioRef.current = audio;
              setPlayingVoiceId(voiceId);
            }}
            setOpen={setOpen}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface VoiceListProps {
  voices: Voice[];
  selectedVoiceId: string;
  playingVoiceId: string | null;
  onSelect: (voiceId: string) => void;
  onPlay: (voiceId: string, previewFile: string) => void;
  setOpen: (open: boolean) => void;
  disabled: boolean;
}

function VoiceList({
  voices,
  selectedVoiceId,
  playingVoiceId,
  onSelect,
  onPlay,
  setOpen,
  disabled,
}: VoiceListProps) {
  return (
    <Command>
      <CommandList>
        <CommandGroup>
          {voices.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            const isPlaying = voice.id === playingVoiceId;
            return (
              <CommandItem
                key={voice.id}
                value={voice.name}
                onSelect={() => {
                  if (disabled) return;
                  onSelect(voice.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between ${
                  isSelected ? "bg-primary/10" : ""
                }`}
                disabled={disabled}
              >
                <span className={`${isSelected ? "text-primary" : ""}`}>
                  {voice.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 flex-shrink-0 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (disabled) return;
                    onPlay(voice.id, voice.previewFile);
                  }}
                  disabled={disabled}
                >
                  {isPlaying ? (
                    <Pause className="text-primary h-4 w-4" />
                  ) : (
                    <Speech className="text-primary h-4 w-4" />
                  )}
                </Button>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
