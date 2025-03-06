import { NextApiRequest, NextApiResponse } from "next";
import { generateSpeech, getAudioDurationMs } from "@/lib/speech";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioBuffer = await generateSpeech(text);

    const durationMs = await getAudioDurationMs(audioBuffer);

    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    res.status(200).json({
      audio: audioBase64,
      durationMs: durationMs,
    });
  } catch (error) {
    console.error("Text synthesis failed:", error);
    res.status(500).json({ error: "Text synthesis failed" });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
