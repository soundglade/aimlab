import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Validate meditation ID format to prevent directory traversal
function isValidMeditationId(id: string): boolean {
  return /^[a-z0-9]{7}$/.test(id);
}

// Generate the expected owner key for comparison
function generateOwnerKey(meditationId: string): string {
  const secret = process.env.JWT_SECRET || "fallback-secret-key";
  return crypto.createHmac("sha256", secret).update(meditationId).digest("hex");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { meditationId, ownerKey } = req.body;

    // Validate required parameters
    if (!meditationId || !ownerKey) {
      return res
        .status(400)
        .json({ error: "Missing meditationId or ownerKey" });
    }

    // Validate meditation ID format
    if (!isValidMeditationId(meditationId)) {
      return res.status(400).json({ error: "Invalid meditation ID format" });
    }

    // Verify ownership
    const expectedOwnerKey = generateOwnerKey(meditationId);
    if (ownerKey !== expectedOwnerKey) {
      return res.status(403).json({ error: "Unauthorized: Invalid owner key" });
    }

    // Define paths
    const meditationDir = path.join(
      process.cwd(),
      "public/storage/meditations",
      meditationId
    );
    const metadataFile = path.join(meditationDir, "metadata.json");
    const audioFile = path.join(meditationDir, "audio.mp3");

    // Delete files and directory
    await Promise.all([
      fs.unlink(metadataFile).catch(() => {}),
      fs.unlink(audioFile).catch(() => {}),
    ]);

    await fs.rmdir(meditationDir).catch(() => {});

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting meditation:", error);
    return res.status(500).json({ error: "Failed to delete meditation" });
  }
}
