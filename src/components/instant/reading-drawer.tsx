import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { ReadingDrawerContent } from "./reading-drawer-content";

interface ReadingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: any | null;
}

export function ReadingDrawer({
  open,
  onOpenChange,
  response,
}: ReadingDrawerProps) {
  const script = response?.script || { title: "", steps: [], completed: false };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto flex h-[calc(100%-40px)] max-w-4xl flex-col bg-white p-0 dark:bg-gray-900">
        <ReadingDrawerContent script={script} />
      </DrawerContent>
    </Drawer>
  );
}
