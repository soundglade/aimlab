import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { customAlphabet } from "nanoid";

const generateShareId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  7
);

// Disable the default body parser to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse the incoming FormData
    const form = formidable({ keepExtensions: true });

    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Extract the metadata and audio file
    const metadataStr = fields.metadata?.[0];
    if (!metadataStr) {
      return res.status(400).json({ error: "Missing metadata" });
    }
    const metadata = JSON.parse(metadataStr);
    const audioFile = (files.audioFile as formidable.File[])?.[0];
    if (!audioFile) {
      return res.status(400).json({ error: "Missing audio file" });
    }

    // Generate a unique ID for this shared meditation
    const shareId = generateShareId();

    // Create directory for storing shared meditations
    const shareDir = path.join(
      process.cwd(),
      "public/storage/rila/shared-meditations",
      shareId
    );
    await fs.mkdir(shareDir, { recursive: true });

    // Save the metadata as JSON
    await fs.writeFile(
      path.join(shareDir, "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );

    // Save the audio file
    await fs.copyFile(audioFile.filepath, path.join(shareDir, "audio.wav"));

    // Generate a share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/m/${shareId}`;

    // Return the share information
    return res.status(200).json({
      shareUrl,
    });
  } catch (error) {
    console.error("Error processing shared meditation:", error);
    return res.status(500).json({
      error: "Failed to process shared meditation",
    });
  }
}
