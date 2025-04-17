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

  const { script } = req.body;
  if (!script || typeof script !== "string") {
    return res
      .status(400)
      .json({ error: "Script is required and must be a string" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    await synthesizeReading({
      script,
      onData: (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (typeof res.flush === "function") res.flush();
      },
    });
    res.end();
  } catch (error) {
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
