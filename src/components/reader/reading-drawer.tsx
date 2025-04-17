import { Drawer, DrawerContent } from "@/components/ui/drawer";

import type { MeditationFormatterResult } from "@/lib/meditation-formatter";
import { ReadingDrawerContent } from "./reading-drawer-content";

interface ReadingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: MeditationFormatterResult | null;
}

export function ReadingDrawer({
  open,
  onOpenChange,
  response,
}: ReadingDrawerProps) {
  const script = response?.script || { title: "", steps: [] };
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex h-[calc(100vh-80px)] flex-col p-0">
        <ReadingDrawerContent script={script} />
      </DrawerContent>
    </Drawer>
  );
}
