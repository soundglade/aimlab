import type { NextApiRequest, NextApiResponse } from "next";
import { fetchMeditationData, MeditationData } from "@/lib/fetch-meditation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeditationData | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.body;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid meditation ID" });
  }

  try {
    const meditationData = await fetchMeditationData(id);
    return res.status(200).json(meditationData);
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Failed to fetch meditation data" });
  }
}
