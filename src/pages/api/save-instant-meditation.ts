import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import OpenAI from "openai";
import { flushMeditationCache } from "@/lib/latest-meditations";

/**
 * System prompt for generating meditation descriptions
 */
const MEDITATION_DESCRIPTION_SYSTEM_PROMPT = `
Based on the meditation content provided, write a short 1-3 sentence description in markdown format that describes what this guided meditation is about.

Do not use Markdown headings and don't prodide titles or subtitles.

Use markdown for formatting, stress, and improve readability (i.e. bold, italic, etc.).

Keep it descriptive and matter-of-fact. Focus on the techniques used. Do not make assumptions about it's use and effects.

Separate paragraphs with one or more empty lines to improve readability.

You can quote the meditation content if it's relevant to the description.

Be very concise, no noise, all signal.
Consider pauses and breaks in the meditation.

If the meditation is not in English, still write the description in English, but mention the language in the description.

Do not mention the language if the meditation is in English.`;

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
    const { readingId, public: isPublic } = req.body;

    if (!readingId || typeof readingId !== "string") {
      return res.status(400).json({ error: "Missing or invalid readingId" });
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

    // Generate description using OpenAI
    let description = "";
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Convert script steps to markdown for better analysis
      const steps = script.steps || [];
      let markdown = "";

      for (const step of steps) {
        switch (step.type) {
          case "speech":
            if (step.text) {
              markdown += `${step.text}\n\n`;
            }
            break;
          case "heading":
            if (step.text) {
              markdown += `## ${step.text}\n\n`;
            }
            break;
          case "pause":
            if (step.duration) {
              markdown += `[pause for ${step.duration} seconds]\n\n`;
            }
            break;
        }
      }

      // Create the meditation content in markdown format
      const meditationMarkdown = `# ${script.title}\n\n${markdown}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: MEDITATION_DESCRIPTION_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: meditationMarkdown,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      description = completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error generating description:", error);
      // Fallback description if OpenAI fails
      description = `A guided meditation session titled "${script.title}". This practice offers moments of mindfulness and relaxation.`;
    }

    // Update script with description and public flag
    script.description = description;
    script.saved = true;
    if (isPublic === true) {
      script.public = true;
    }

    // Save updated script back to file
    await fs.writeFile(scriptPath, JSON.stringify(script, null, 2));

    flushMeditationCache();

    // Generate owner key
    const ownerKey = generateOwnerKey(readingId);

    // Generate URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = `${baseUrl}/r/${readingId}`;

    return res.status(200).json({
      success: true,
      ownerKey,
      title: script.title,
      url,
      description,
      public: script.public || false,
      saved: script.saved || false,
    });
  } catch (error) {
    console.error("Error saving instant meditation:", error);
    return res.status(500).json({ error: "Failed to save meditation" });
  }
}
