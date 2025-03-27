import { NextApiRequest, NextApiResponse } from "next";
import { getLatestMeditations } from "../../lib/latest-meditations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const meditationFolders = await getLatestMeditations();
    res.status(200).json(meditationFolders);
  } catch (error) {
    console.error("Error retrieving meditation data:", error);
    res.status(500).json({ error: "Failed to retrieve meditation data" });
  }
}
