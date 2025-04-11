import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken, getCookieName } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate playground user
  const playgroundCookie = req.cookies[getCookieName("playground")];
  if (!playgroundCookie) {
    return res.status(401).json({ error: "Missing playground token" });
  }

  let tokenPayload: any;
  try {
    tokenPayload = await verifyToken(playgroundCookie);
    if (!tokenPayload || tokenPayload.area !== "playground") {
      return res.status(401).json({ error: "Invalid playground token" });
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid playground token" });
  }

  // Parse body
  const {
    text,
    voice_id,
    model_id,
    stability,
    similarity_boost,
    style,
    use_speaker_boost,
    speed,
  } = req.body;

  if (typeof text !== "string" || !text) {
    return res.status(400).json({ error: "Text is required" });
  }
  if (typeof voice_id !== "string" || !voice_id) {
    return res.status(400).json({ error: "voice_id is required" });
  }
  if (typeof model_id !== "string" || !model_id) {
    return res.status(400).json({ error: "model_id is required" });
  }

  // Call ElevenLabs service and return audio data
  try {
    const { generateSpeechWithSettings } = await import(
      "@/lib/services/elevenlabs"
    );
    const audioBuffer = await generateSpeechWithSettings({
      text,
      voice_id,
      model_id,
      stability,
      similarity_boost,
      style,
      use_speaker_boost,
      speed,
    });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="output.wav"');
    res.status(200).send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("ElevenLabs API error:", err);
    res.status(500).json({ error: "Failed to generate speech" });
  }
}
