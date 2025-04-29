import { NextApiRequest, NextApiResponse } from "next";
import { synthesizeReading } from "@/lib/reading-synthesizer";

interface ExtendedResponse extends NextApiResponse {
  flush?: () => void;
}

export default async function handler(
  req: NextApiRequest,
  res: ExtendedResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { script, settings } = req.body;
  if (!script || typeof script !== "string") {
    return res
      .status(400)
      .json({ error: "Script is required and must be a string" });
  }

  // Validate settings for ElevenLabs
  if (settings && typeof settings === "object") {
    if (settings.service === "elevenlabs") {
      if (
        !settings.serviceOptions ||
        typeof settings.serviceOptions.apiKey !== "string" ||
        settings.serviceOptions.apiKey.trim() === ""
      ) {
        return res.status(400).json({
          error:
            "Invalid ElevenLabs settings: apiKey is required and must be a non-empty string.",
        });
      }
    } else {
      return res.status(400).json({
        error: "Only ElevenLabs TTS is supported for custom settings.",
      });
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Support aborting synthesis if client disconnects
  const abortController = new AbortController();
  req.on("close", () => {
    console.log(
      "Client disconnected from SSE /api/start-reading, aborting synthesis"
    );
    abortController.abort();
  });
  // Also log on explicit abort event
  req.on("aborted", () => {
    console.log("Client request aborted /api/start-reading");
    abortController.abort();
  });

  res.socket?.setTimeout(0);

  // Log when the underlying socket closes
  res.socket?.on("close", () => {
    console.log("Socket closed for /api/start-reading");
    abortController.abort();
  });

  try {
    // Directly call synthesizeReading; let it throw on abort for debugging
    await synthesizeReading({
      script,
      onData: (data) => {
        if (!data) return;
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (typeof res.flush === "function") res.flush();
      },
      signal: abortController.signal,
      settings,
    });
    res.end();
  } catch (error: any) {
    if (abortController.signal.aborted) {
      console.log("Synthesis aborted due to client disconnect");
    }
    res.write(
      `data: ${JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      })}\n\n`
    );
    if (typeof res.flush === "function") res.flush();
    res.end();
  }
}

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};
