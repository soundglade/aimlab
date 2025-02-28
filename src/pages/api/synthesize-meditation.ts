import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Replicate from "replicate";
import { parseBuffer } from "music-metadata";

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Kokoro TTS model ID
const KOKORO_MODEL_ID =
  "jaaari/kokoro-82m:f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13";

// Generate speech using Kokoro TTS
async function generateSpeech(text: string): Promise<ArrayBuffer> {
  try {
    // Call Kokoro TTS API via Replicate
    const input = { text, voice: "af_nicole" };

    // Get the audio URL from Replicate
    const outputUrl = (await replicate.run(KOKORO_MODEL_ID, {
      input,
    })) as unknown as string;

    // Fetch the audio data
    const audioResponse = await fetch(outputUrl);
    if (!audioResponse.ok) {
      throw new Error(
        `Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`
      );
    }

    return await audioResponse.arrayBuffer();
  } catch (error) {
    console.error("Speech generation error:", error);
    throw error;
  }
}

// Get audio duration in milliseconds using music-metadata
async function getAudioDurationMs(audioBuffer: ArrayBuffer): Promise<number> {
  try {
    const metadata = await parseBuffer(Buffer.from(audioBuffer));
    if (!metadata.format.duration) {
      throw new Error("Could not determine audio duration");
    }
    return Math.round(metadata.format.duration * 1000);
  } catch (error) {
    console.error("Error getting audio duration:", error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Create a readable stream
  const stream = new Readable({
    read() {}, // Required implementation
  });

  try {
    const { sections, title = "Untitled Meditation" } = req.body;

    // Enable streaming
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Transfer-Encoding", "chunked");

    // Pipe the stream to the response
    stream.pipe(res);

    // Send initial metadata with title
    stream.push(
      JSON.stringify({
        type: "metadata",
        title: title,
      }) + "\n"
    );

    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      if (section.type === "speech") {
        // Send progress update for starting this section
        stream.push(
          JSON.stringify({
            type: "progress",
            progress: (i / sections.length) * 100,
            sectionIndex: i,
          }) + "\n"
        );

        try {
          // Generate speech for this section
          const audioBuffer = await generateSpeech(section.text);

          // Calculate audio duration using the helper function
          const durationMs = await getAudioDurationMs(audioBuffer);

          // Send audio data with durationMs
          stream.push(
            JSON.stringify({
              type: "audio",
              sectionIndex: i,
              data: Buffer.from(audioBuffer).toString("base64"),
              durationMs,
            }) + "\n"
          );
        } catch (err) {
          console.error(`Error generating audio for section ${i}:`, err);
          stream.push(
            JSON.stringify({
              type: "error",
              message: `Failed to generate audio for section ${i + 1}`,
              sectionIndex: i,
            }) + "\n"
          );
        }
      }
    }

    // Send completion message
    stream.push(
      JSON.stringify({
        type: "complete",
        progress: 100,
      }) + "\n"
    );

    // End the stream
    stream.push(null);
  } catch (error) {
    console.error("Synthesis failed:", error);
    // If we haven't started streaming yet, send error response
    if (!res.writableEnded) {
      res.status(500).json({ error: "Synthesis failed" });
    }
    // If we're already streaming, send error message through stream
    else {
      stream.push(
        JSON.stringify({
          type: "error",
          message: "Synthesis failed",
        }) + "\n"
      );
      stream.push(null);
    }
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
