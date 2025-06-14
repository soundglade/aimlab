import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollText } from "lucide-react";
import { EXAMPLES } from "./examples";

function useMediaQuery(query) {
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

export function ExamplesSelect({ onSelect }) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selected, setSelected] = React.useState<any>(null);

  const handleSelect = (example) => {
    setSelected(example);
    setOpen(false);
    if (onSelect) onSelect(example);
  };

  const buttonLabel = "Examples";

  const button = (
    <Button variant="outline" className="justify-between border-0">
      <ScrollText className="opacity-50" />
      {buttonLabel}
    </Button>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{button}</PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="center">
          <ExampleList setOpen={setOpen} setSelected={handleSelect} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{button}</DrawerTrigger>
      <DrawerContent className="h-[calc(100%-40px)]">
        <div className="mt-4 border-t">
          <ExampleList setOpen={setOpen} setSelected={handleSelect} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ExampleList({ setOpen, setSelected }) {
  return (
    <Command>
      <CommandInput placeholder="Search examples..." />
      <CommandList className="max-h-none">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {EXAMPLES.map((example) => (
            <CommandItem
              key={example.label}
              value={example.label}
              onSelect={() => {
                setSelected(example);
                setOpen(false);
              }}
            >
              {example.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
