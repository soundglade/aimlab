import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";

// Helper to create a dummy WAV buffer (sine wave)
function createDummyAudioBuffer(durationMs: number = 1000): Buffer {
  // Audio parameters
  const numChannels = 1; // Mono
  const sampleRate = 44100;
  const bitsPerSample = 16;
  const samples = Math.floor(sampleRate * (durationMs / 1000));

  // Calculate sizes
  const dataSize = samples * (bitsPerSample / 8) * numChannels;
  const headerSize = 44; // Standard WAV header size
  const totalSize = headerSize + dataSize;

  // Create buffer
  const buffer = Buffer.alloc(totalSize);

  // Write WAV headers
  // RIFF chunk descriptor
  buffer.write("RIFF", 0); // ChunkID
  buffer.writeInt32LE(totalSize - 8, 4); // ChunkSize
  buffer.write("WAVE", 8); // Format

  // fmt sub-chunk
  buffer.write("fmt ", 12); // Subchunk1ID
  buffer.writeInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeInt16LE(numChannels, 22); // NumChannels
  buffer.writeInt32LE(sampleRate, 24); // SampleRate
  buffer.writeInt32LE(
    // ByteRate
    sampleRate * numChannels * (bitsPerSample / 8),
    28
  );
  buffer.writeInt16LE(
    // BlockAlign
    numChannels * (bitsPerSample / 8),
    32
  );
  buffer.writeInt16LE(bitsPerSample, 34); // BitsPerSample

  // data sub-chunk
  buffer.write("data", 36); // Subchunk2ID
  buffer.writeInt32LE(dataSize, 40); // Subchunk2Size

  // Write audio data
  for (let i = 0; i < samples; i++) {
    // Generate sine wave
    const t = i / sampleRate;
    const frequency = 440; // A4 note
    const value = Math.floor(Math.sin(2 * Math.PI * frequency * t) * 32767);
    buffer.writeInt16LE(value, headerSize + i * 2);
  }

  return buffer;
}

// Simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const { sections, voiceSettings, title = "Untitled Meditation" } = req.body;

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
        // Simulate processing delay (1-2 seconds per section)
        await delay(1000 + Math.random() * 1000);

        // Send progress update
        stream.push(
          JSON.stringify({
            type: "progress",
            progress: (i / sections.length) * 100,
            sectionIndex: i,
          }) + "\n"
        ); // Add newline as message separator

        // Create dummy audio data
        const audioBuffer = createDummyAudioBuffer(2000);

        // Send audio data
        stream.push(
          JSON.stringify({
            type: "audio",
            sectionIndex: i,
            data: audioBuffer.toString("base64"),
          }) + "\n"
        );
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
