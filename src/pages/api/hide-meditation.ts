import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

/**
 * Generates a unique owner key for a meditation
 */
function generateOwnerKey(meditationId: string): string {
  const secret = process.env.JWT_SECRET || "fallback-secret-key";
  return crypto.createHmac("sha256", secret).update(meditationId).digest("hex");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { readingId, ownerKey } = req.body;

    if (!readingId || typeof readingId !== "string") {
      return res.status(400).json({ error: "Missing or invalid readingId" });
    }

    if (!ownerKey || typeof ownerKey !== "string") {
      return res.status(400).json({ error: "Missing or invalid ownerKey" });
    }

    // Verify ownership
    const expectedOwnerKey = generateOwnerKey(readingId);
    if (ownerKey !== expectedOwnerKey) {
      return res.status(403).json({ error: "Unauthorized: Invalid owner key" });
    }

    // Load the script.json file
    const scriptPath = path.join(
      process.cwd(),
      "public/storage/readings",
      readingId,
      "script.json"
    );

    let script;
    try {
      const scriptContent = await fs.readFile(scriptPath, "utf-8");
      script = JSON.parse(scriptContent);
    } catch (error) {
      return res.status(404).json({ error: "Reading not found" });
    }

    // Set public flag to false (hide the meditation)
    script.public = false;

    // Save updated script back to file
    await fs.writeFile(scriptPath, JSON.stringify(script, null, 2));

    return res.status(200).json({
      success: true,
      title: script.title,
      public: false,
    });
  } catch (error) {
    console.error("Error hiding meditation:", error);
    return res.status(500).json({ error: "Failed to hide meditation" });
  }
}
