import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { Meditation } from "@/components/types";
import { Worker } from "worker_threads";
import path from "path";
import { WorkerMessage, WorkerInput } from "@/workers/types";

/**
 * API endpoint for synthesizing a meditation into audio
 *
 * @description This API takes a meditation object and synthesizes it into audio,
 * saving the result and returning a URL to access it.
 *
 * @input
 * - req.body.structuredMeditation: A Meditation object containing steps to synthesize
 * - req.body.voiceId: The voice ID to use for the synthesis
 *
 * @output
 * A stream of JSON events, each on a new line:
 *
 * 1. Progress events:
 *    {
 *      "type": "progress",
 *      "progress": number // 0-100 indicating percentage complete
 *    }
 *
 * 2. Complete event (success):
 *    {
 *      "type": "complete",
 *      "success": true,
 *      "progress": 100,
 *      "meditation": Meditation, // The updated meditation with timeline
 *      "url": string, // URL to access the saved meditation
 *      "meditationId": string, // Unique ID of the meditation
 *      "ownerKey": string // Key to prove ownership of the meditation
 *    }
 *
 * 3. Complete event (failure):
 *    {
 *      "type": "complete",
 *      "success": false,
 *      "error": string // Error message
 *    }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stream = new Readable({ read() {} });

  const sendEvent = (type, data = {}) => {
    stream.push(JSON.stringify({ type, ...data }) + "\n");
  };

  const handleError = (errorMessage) => {
    console.error(errorMessage);

    if (!res.writableEnded) {
      if (stream.readable) {
        sendEvent("complete", { success: false, error: errorMessage });
        stream.push(null);
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  };

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Transfer-Encoding", "chunked");
  stream.pipe(res);

  const meditation = req.body.structuredMeditation as Meditation;
  const voiceId = req.body.voiceId || "nicole";

  // Determine the path to the worker file
  const workerPath = path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "production"
      ? "dist/src/workers/synthesize-meditation-worker.js"
      : "src/workers/synthesize-meditation-worker.ts"
  );

  try {
    // Create worker input
    const workerInput: WorkerInput = {
      meditation,
      voiceId,
    };

    // Create the worker
    const worker = new Worker(workerPath, {
      workerData: workerInput,
      // For development - allow TypeScript files to be used directly with tsx
      execArgv:
        process.env.NODE_ENV !== "production" ? ["-r", "tsx"] : undefined,
    });

    // Set up event listeners
    worker.on("message", (message: WorkerMessage) => {
      if (message.type === "progress") {
        sendEvent("progress", { progress: message.progress });
      } else if (message.type === "complete") {
        if (message.success) {
          sendEvent("complete", {
            success: true,
            progress: 100,
            meditation: message.meditation,
            url: message.url,
            meditationId: message.meditationId,
            ownerKey: message.ownerKey,
          });
        } else {
          sendEvent("complete", {
            success: false,
            error: message.error,
          });
        }
        stream.push(null);
      }
    });

    worker.on("error", (error) => {
      handleError(`Worker error: ${error.message}`);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        handleError(`Worker stopped with exit code ${code}`);
      }
    });
  } catch (error) {
    handleError(
      `Failed to initialize worker: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
