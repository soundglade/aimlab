import * as React from "react";
import { useAtom } from "jotai";
import { languageAtom } from "./atoms";
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
import { Globe } from "lucide-react";

interface Language {
  id: string;
  name: string;
  flag: string;
}

// Supported languages for meditation
export const LANGUAGES: Language[] = [
  {
    id: "en",
    name: "English",
    flag: "🇬🇧",
  },
  {
    id: "fr",
    name: "French",
    flag: "🇫🇷",
  },
  {
    id: "es",
    name: "Spanish",
    flag: "🇪🇸",
  },
  {
    id: "it",
    name: "Italian",
    flag: "🇮🇹",
  },
  {
    id: "ja",
    name: "Japanese",
    flag: "🇯🇵",
  },
  {
    id: "zh",
    name: "Chinese",
    flag: "🇨🇳",
  },
  {
    id: "hi",
    name: "Hindi",
    flag: "🇮🇳",
  },
  {
    id: "pt",
    name: "Portuguese",
    flag: "🇵🇹",
  },
];

interface LanguageSelectProps {
  disabled?: boolean;
  onLanguageSelect?: (languageId: string) => void;
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

export function LanguageSelect({
  disabled = false,
  onLanguageSelect,
}: LanguageSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedLanguageId, setSelectedLanguageId] = useAtom(languageAtom);
  const [mounted, setMounted] = React.useState(false);

  const selectedLanguage = LANGUAGES.find((l) => l.id === selectedLanguageId);
  const buttonLabel = selectedLanguage ? (
    isDesktop ? (
      <span className="flex items-center gap-2.5">
        <span className="text-lg">{selectedLanguage.flag}</span>
        <span>{selectedLanguage.name}</span>
      </span>
    ) : (
      <span className="text-lg">{selectedLanguage.flag}</span>
    )
  ) : isDesktop ? (
    "Select language"
  ) : (
    "🌐"
  );

  const handleSelect = (languageId: string) => {
    if (disabled) return;
    setSelectedLanguageId(languageId);
    setOpen(false);
    // Notify parent component that user manually selected a language
    onLanguageSelect?.(languageId);
  };

  const button = (
    <Button
      variant="secondary"
      size="sm"
      className="px-2.5! justify-between border-0"
      disabled={disabled}
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {buttonLabel}
    </Button>
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{button}</PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="center">
          <LanguageList
            disabled={disabled}
            languages={LANGUAGES}
            selectedLanguageId={selectedLanguageId}
            onSelect={handleSelect}
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
          <LanguageList
            disabled={disabled}
            languages={LANGUAGES}
            selectedLanguageId={selectedLanguageId}
            onSelect={handleSelect}
            setOpen={setOpen}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface LanguageListProps {
  languages: Language[];
  selectedLanguageId: string;
  onSelect: (languageId: string) => void;
  setOpen: (open: boolean) => void;
  disabled: boolean;
}

function LanguageList({
  languages,
  selectedLanguageId,
  onSelect,
  setOpen,
  disabled,
}: LanguageListProps) {
  return (
    <Command>
      <CommandList className="max-h-none">
        <CommandGroup>
          {languages.map((language) => {
            const isSelected = language.id === selectedLanguageId;
            return (
              <CommandItem
                key={language.id}
                value={language.name}
                onSelect={() => {
                  if (disabled) return;
                  onSelect(language.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center cursor-pointer justify-between ${
                  isSelected ? "!bg-primary/40" : ""
                }`}
                disabled={disabled}
              >
                <span
                  className={`flex items-center gap-2 ${
                    isSelected ? "!text-primary-foreground" : ""
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  {language.name}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
