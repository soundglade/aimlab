import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { generateSpeech, getAudioDurationMs } from "@/lib/speech";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
