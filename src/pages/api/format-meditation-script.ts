import type { NextApiRequest, NextApiResponse } from "next";
import { formatMeditationScript } from "@/lib/meditation-formatter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { script } = req.body;

    if (!script || typeof script !== "string") {
      return res.status(400).json({
        message: "Script is required and must be a string",
      });
    }

    const formattedResult = await formatMeditationScript(script);

    // Ensure there's a default title if none was extracted
    if (!formattedResult.isRejected && !formattedResult.title) {
      formattedResult.title = "Untitled Meditation";
    }

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error("Error processing script:", error);
    res.status(500).json({
      message: "Error processing meditation script",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
