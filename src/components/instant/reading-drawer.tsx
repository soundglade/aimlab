import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { ReadingDrawerContent } from "./reading-drawer-content";

interface ReadingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: any | null;
}

function sanitizeScript(script: any) {
  if (!script || !Array.isArray(script.steps)) return script;

  const sanitizedScript = {
    ...script,
    steps: script.steps.map((step: any, idx: number) => ({ ...step, idx })),
  };

  return sanitizedScript;
}

export function ReadingDrawer({
  open,
  onOpenChange,
  response,
}: ReadingDrawerProps) {
  const script = response?.script || { title: "", steps: [], completed: false };

  const sanitizedScript = sanitizeScript(script);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto flex h-[calc(100%-40px)] max-w-4xl flex-col bg-white p-0 dark:bg-gray-900">
        <ReadingDrawerContent script={sanitizedScript} />
      </DrawerContent>
    </Drawer>
  );
}
