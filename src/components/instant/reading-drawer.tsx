import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { ReadingDrawerContent } from "./reading-drawer-content";

interface ReadingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: any | null;
}

function calculateSynthesized(script: any): boolean {
  // Default to false if script is not completed
  if (!script.completed) return false;

  // Check if all steps are completed
  const allStepsCompleted = script.steps.every((step: any) => step.completed);
  if (!allStepsCompleted) return false;

  // Check if all speech and pause steps have audio ending with .mp3
  const speechAndPauseSteps = script.steps.filter(
    (step: any) => step.type === "speech" || step.type === "pause"
  );

  const allAudioSynthesized = speechAndPauseSteps.every(
    (step: any) => typeof step.audio === "string" && step.audio.endsWith(".mp3")
  );

  return allAudioSynthesized;
}

function sanitizeScript(script: any) {
  if (!script || !Array.isArray(script.steps)) return script;

  const sanitizedScript = {
    ...script,
    steps: script.steps.map((step: any, idx: number) => ({ ...step, idx })),
  };

  // Add the synthesized property
  sanitizedScript.synthesized = calculateSynthesized(sanitizedScript);

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
