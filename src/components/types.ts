import type { FormattedScript } from "@/lib/meditation-formatter";
import { Timing } from "@/components/utils/meditation-timeline";

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
  description?: string;
  coverImageUrl?: string;
}

export type ReadingStep = FormattedScript["steps"][number] & {
  idx?: number;
  audio?: string;
  completed?: boolean;
};

export interface Reading {
  title: string;
  steps: ReadingStep[];
}
