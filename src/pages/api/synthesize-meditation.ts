import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { Meditation } from "@/components/rila/types";
import { synthesizeMeditation } from "@/lib/synthesize-meditation";
import { saveMeditation } from "@/lib/save-meditation";

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
      if (success && audioBuffer && updatedMeditation) {
        url = await saveMeditation(audioBuffer, updatedMeditation);
      }

      sendEvent("complete", {
        success,
        progress: 100,
        meditation: updatedMeditation,
        url,
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
