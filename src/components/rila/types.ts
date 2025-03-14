import type { FormattedScript } from "@/lib/meditation-formatter";
import { Timing } from "./utils/meditation-timeline";

// Define types for the component props
export interface RilaFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type MeditationStep = FormattedScript["steps"][number] & {
  audioFileId?: string;
  durationMs?: number;
};

export interface Meditation {
  title: string;
  steps: MeditationStep[];
  timeline?: {
    timings: Timing[];
    totalDurationMs: number;
  };
  fullAudioFileId?: string;
}
