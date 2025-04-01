import { Meditation } from "@/components/types";

export interface WorkerInput {
  meditation: Meditation;
  voiceId: string;
}

export type ProgressUpdate = {
  type: "progress";
  progress: number;
};

export type CompletionResult = {
  type: "complete";
  success: true;
  progress: 100;
  meditation: Meditation;
  url: string | null;
  meditationId: string | null;
  ownerKey: string | null;
};

export type ErrorResult = {
  type: "complete";
  success: false;
  error: string;
};

export type WorkerMessage = ProgressUpdate | CompletionResult | ErrorResult;
