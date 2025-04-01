import { workerData, parentPort } from "worker_threads";
import { synthesizeMeditation } from "@/lib/synthesize-meditation";
import { saveMeditation } from "@/lib/save-meditation";
import { WorkerInput, WorkerMessage } from "./types";

if (!parentPort) {
  throw new Error("This module must be run as a worker thread");
}

const sendMessage = (message: WorkerMessage) => {
  if (parentPort) {
    parentPort.postMessage(message);
  }
};

const { meditation, voiceId } = workerData as WorkerInput;

async function runMeditationSynthesis() {
  await synthesizeMeditation(meditation, {
    voiceId,
    onProgress: (progress) => {
      sendMessage({ type: "progress", progress });
    },
    onComplete: async (success, audioBuffer, updatedMeditation) => {
      if (success && audioBuffer && updatedMeditation) {
        // Save the meditation
        let url: string | null = null;
        let meditationId: string | null = null;
        let ownerKey: string | null = null;

        const result = await saveMeditation(audioBuffer, updatedMeditation);
        if (result) {
          url = result.url;
          meditationId = result.meditationId;
          ownerKey = result.ownerKey;
        }

        sendMessage({
          type: "complete",
          success: true,
          progress: 100,
          meditation: updatedMeditation,
          url,
          meditationId,
          ownerKey,
        });
      }
    },
    onError: (error) => {
      sendMessage({
        type: "complete",
        success: false,
        error,
      });
    },
  });
}

runMeditationSynthesis();
