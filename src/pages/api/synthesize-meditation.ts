import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { generateSpeech, getAudioDurationMs } from "@/lib/speech";
import { Meditation } from "@/components/rila/types";

export async function synthesizeMeditation(
  meditation: Meditation,
  {
    speechGenerator = generateSpeech,
    durationCalculator = getAudioDurationMs,
    onProgress = (progress: number) => {},
    onComplete = (success: boolean) => {},
    onError = (message: string) => {},
  } = {}
) {
  try {
    const speechSteps = meditation.steps.filter(
      (step) => step.type === "speech"
    );
    const totalSteps = speechSteps.length;

    const calculateProgress = (current, total) => {
      return Math.round((current / total) * 100);
    };

    onProgress(0);

    for (let i = 0; i < totalSteps; i++) {
      const step = speechSteps[i];
      onProgress(calculateProgress(i, totalSteps));

      try {
        const audioBuffer = await speechGenerator(step.text);
        await durationCalculator(audioBuffer);
        onProgress(calculateProgress(i + 1, totalSteps));
      } catch (err) {
        onError(`Failed to generate audio for section ${i + 1}`);
        return false;
      }
    }

    onComplete(true);
    return true;
  } catch (error) {
    onError("Synthesis failed");
    return false;
  }
}

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
    onComplete: () => {
      sendEvent("complete", { success: true, progress: 100 });
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
