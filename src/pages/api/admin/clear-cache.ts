import { NextApiRequest, NextApiResponse } from "next";
import { getAuthToken, verifyToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get and verify admin token
    const token = req.cookies[`auth-token-admin`];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.area !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Path to cache directory (relative to project root)
    const cachePath = path.join(process.cwd(), "cache");

    // Check if cache directory exists
    try {
      await fs.access(cachePath);
    } catch (error) {
      // Cache directory doesn't exist, nothing to clear
      return res.status(200).json({ message: "Cache is already empty" });
    }

    // Get list of files in cache directory
    const files = await fs.readdir(cachePath);

    // Delete each file in the cache directory
    for (const file of files) {
      const filePath = path.join(cachePath, file);
      await fs.unlink(filePath);
    }

    return res.status(200).json({ message: "Cache cleared successfully" });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return res.status(500).json({ error: "Failed to clear cache" });
  }
}
