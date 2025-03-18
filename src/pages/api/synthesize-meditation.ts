import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { Meditation } from "@/components/rila/types";
import { synthesizeMeditation } from "@/lib/synthesize-meditation";
import { saveMeditation } from "@/lib/save-meditation";

/**
 * API endpoint for synthesizing a meditation into audio
 *
 * @description This API takes a meditation object and synthesizes it into audio,
 * saving the result and returning a URL to access it.
 *
 * @input
 * - req.body: A Meditation object containing steps to synthesize
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

  const meditation = req.body as Meditation;

  await synthesizeMeditation(meditation, {
    onProgress: (progress) => {
      sendEvent("progress", { progress });
    },
    onComplete: async (success, audioBuffer, updatedMeditation) => {
      let url: string | null = null;
      let meditationId: string | null = null;
      let ownerKey: string | null = null;

      if (success && audioBuffer && updatedMeditation) {
        const result = await saveMeditation(audioBuffer, updatedMeditation);
        if (result) {
          url = result.url;
          meditationId = result.meditationId;
          ownerKey = result.ownerKey;
        }
      }

      sendEvent("complete", {
        success,
        progress: 100,
        meditation: updatedMeditation,
        url,
        meditationId,
        ownerKey,
      });
      stream.push(null);
    },
    onError: handleError,
  });
}

export const config = {
  api: {
    responseLimit: false,
  },
};
