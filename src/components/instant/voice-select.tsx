import * as React from "react";
import { useAtom } from "jotai";
import { voiceIdAtom, languageAtom } from "./atoms";
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
import { Pause, Speech, Play } from "lucide-react";

interface Voice {
  id: string;
  name: string;
  description?: string;
  previewFile: string;
  language: string; // Language code (e.g., 'en', 'fr', 'es')
}

// Predefined voices for instant meditation - organized by language
export const VOICES: Voice[] = [
  // English voices
  {
    id: "grace",
    name: "Grace",
    previewFile: "/assets/grace-voice-sample.mp3",
    language: "en",
  },
  {
    id: "kate",
    name: "Kate",
    previewFile: "/assets/kate-voice-sample.mp3",
    language: "en",
  },
  {
    id: "emily",
    name: "Emily",
    previewFile: "/assets/emily-voice-sample.mp3",
    language: "en",
  },
  {
    id: "ben",
    name: "Ben",
    previewFile: "/assets/ben-voice-sample.mp3",
    language: "en",
  },
  {
    id: "matthew",
    name: "Matthew",
    previewFile: "/assets/matthew-voice-sample.mp3",
    language: "en",
  },
  {
    id: "james",
    name: "James",
    previewFile: "/assets/james-voice-sample.mp3",
    language: "en",
  },

  // French voices
  {
    id: "marie",
    name: "Marie",
    previewFile: "/assets/marie-voice-sample.mp3",
    language: "fr",
  },
  {
    id: "pierre",
    name: "Pierre",
    previewFile: "/assets/pierre-voice-sample.mp3",
    language: "fr",
  },

  // Spanish voices
  {
    id: "sofia",
    name: "Sofia",
    previewFile: "/assets/sofia-voice-sample.mp3",
    language: "es",
  },
  {
    id: "carlos",
    name: "Carlos",
    previewFile: "/assets/carlos-voice-sample.mp3",
    language: "es",
  },

  // Italian voices
  {
    id: "giulia",
    name: "Giulia",
    previewFile: "/assets/giulia-voice-sample.mp3",
    language: "it",
  },
  {
    id: "marco",
    name: "Marco",
    previewFile: "/assets/marco-voice-sample.mp3",
    language: "it",
  },

  // Japanese voices
  {
    id: "yuki",
    name: "Yuki",
    previewFile: "/assets/yuki-voice-sample.mp3",
    language: "ja",
  },
  {
    id: "hiroshi",
    name: "Hiroshi",
    previewFile: "/assets/hiroshi-voice-sample.mp3",
    language: "ja",
  },

  // Chinese voices
  {
    id: "mei",
    name: "Mei",
    previewFile: "/assets/mei-voice-sample.mp3",
    language: "zh",
  },
  {
    id: "wei",
    name: "Wei",
    previewFile: "/assets/wei-voice-sample.mp3",
    language: "zh",
  },

  // Hindi voices
  {
    id: "priya",
    name: "Priya",
    previewFile: "/assets/priya-voice-sample.mp3",
    language: "hi",
  },
  {
    id: "arjun",
    name: "Arjun",
    previewFile: "/assets/arjun-voice-sample.mp3",
    language: "hi",
  },

  // Portuguese voices
  {
    id: "ana",
    name: "Ana",
    previewFile: "/assets/ana-voice-sample.mp3",
    language: "pt",
  },
  {
    id: "joao",
    name: "João",
    previewFile: "/assets/joao-voice-sample.mp3",
    language: "pt",
  },
];

/**
 * Get voices filtered by language
 */
export function getVoicesForLanguage(languageId: string): Voice[] {
  return VOICES.filter((voice) => voice.language === languageId);
}

/**
 * Get the first available voice for a language
 */
export function getFirstVoiceForLanguage(languageId: string): Voice | null {
  const voices = getVoicesForLanguage(languageId);
  return voices.length > 0 ? voices[0] : null;
}

interface VoiceSelectProps {
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

export function VoiceSelect({ disabled = false }: VoiceSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedVoiceId, setSelectedVoiceId] = useAtom(voiceIdAtom);
  const [selectedLanguage] = useAtom(languageAtom);
  const [mounted, setMounted] = React.useState(false);

  // Get voices for the current language
  const availableVoices = React.useMemo(() => {
    return getVoicesForLanguage(selectedLanguage);
  }, [selectedLanguage]);

  // Check if current voice is valid for the selected language
  const selectedVoice = availableVoices.find((v) => v.id === selectedVoiceId);

  // Auto-select first voice if current voice is not available for the language
  React.useEffect(() => {
    if (availableVoices.length > 0 && !selectedVoice) {
      const firstVoice = availableVoices[0];
      setSelectedVoiceId(firstVoice.id);
    }
  }, [availableVoices, selectedVoice, setSelectedVoiceId]);

  const buttonLabel = selectedVoice
    ? isDesktop
      ? `Voice: ${selectedVoice.name}`
      : selectedVoice.name
    : isDesktop
    ? "Select voice"
    : "Voice";

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
    setSelectedVoiceId(voiceId);
    setOpen(false);
  };

  const button = (
    <Button
      variant="secondary"
      size="sm"
      className="px-3! justify-between border-0"
      disabled={disabled}
      style={{ opacity: mounted ? 1 : 0 }}
    >
      <Speech className="text-primary mx-0.5 opacity-80" />
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

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{button}</PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="center">
          <VoiceList
            disabled={disabled}
            voices={availableVoices}
            selectedVoiceId={selectedVoiceId}
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
            voices={availableVoices}
            selectedVoiceId={selectedVoiceId}
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
                className={`flex w-full items-center cursor-pointer justify-between ${
                  isSelected ? "!bg-primary/40" : ""
                }`}
                disabled={disabled}
              >
                <span
                  className={`${isSelected ? "!ext-primary-foreground" : ""}`}
                >
                  {voice.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-secondary hover:bg-secondary h-7 w-7 flex-shrink-0 p-0"
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
                    <Play className="text-primary h-4 w-4" />
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
