import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { fetchReadingData, ReadingData } from "@/lib/fetch-reading";

/**
 * Generates a unique owner key for a meditation/reading
 */
function generateOwnerKey(id: string): string {
  const secret = process.env.JWT_SECRET || "fallback-secret-key";
  return crypto.createHmac("sha256", secret).update(id).digest("hex");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadingData | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.body;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid meditation ID" });
  }

  try {
    const readingData = await fetchReadingData(id);

    // If there's an error or no script, return it as-is
    if (readingData.error || !readingData.script) {
      return res.status(200).json(readingData);
    }

    // Check if the reading is public
    const isPublic = readingData.script.public === true;

    if (!isPublic) {
      // For private readings, check if user has valid ownerKey
      const ownerKey = req.cookies[`meditation-ownerKey-${id}`];

      if (!ownerKey) {
        // No ownerKey found, return same error as missing ID
        return res
          .status(400)
          .json({ error: "Missing or invalid meditation ID" });
      }

      // Validate ownerKey against the expected ownerKey for this reading
      const expectedOwnerKey = generateOwnerKey(id);
      if (ownerKey !== expectedOwnerKey) {
        // Invalid ownerKey, return same error as missing ID
        return res
          .status(400)
          .json({ error: "Missing or invalid meditation ID" });
      }
    }

    return res.status(200).json(readingData);
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Failed to fetch reading data" });
  }
}
