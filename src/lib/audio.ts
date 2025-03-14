import { Meditation } from "@/components/rila/types";
import { AudioBuffer, GainNode, OfflineAudioContext } from "node-web-audio-api";
import audioBufferToWav from "audiobuffer-to-wav";

/**
 * Creates a concatenated audio file from individual audio buffers based on a meditation timeline
 */
export async function createConcatenatedAudio(
  audioBuffers: Map<number, ArrayBuffer>,
  timeline: NonNullable<Meditation["timeline"]>,
  onProgress = (progress: number) => {}
): Promise<Buffer> {
  const { timings, totalDurationMs } = timeline;

  // Create audio context
  const audioContext = new OfflineAudioContext(
    2,
    Math.ceil((totalDurationMs * 44100) / 1000),
    44100
  );

  let currentTime = 0;

  // Process each timing
  for (let i = 0; i < timings.length; i++) {
    const timing = timings[i];
    onProgress((i / timings.length) * 100);

    if (timing.type === "speech") {
      // Get the audio buffer for this step
      const rawBuffer = audioBuffers.get(timing.index);
      if (rawBuffer) {
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(rawBuffer);

        // Create source node
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Connect to destination
        const gain = new GainNode(audioContext, { gain: 1.0 });
        source.connect(gain);
        gain.connect(audioContext.destination);

        // Schedule playback
        source.start(currentTime);
        currentTime += audioBuffer.duration;
      }
    } else if (timing.type === "pause" || timing.type === "gap") {
      // For pauses and gaps, just advance the time
      currentTime += timing.durationMs / 1000;
    }
  }

  // Render the audio
  const renderedBuffer = await audioContext.startRendering();

  // Convert to WAV buffer
  return Buffer.from(audioBufferToWav(renderedBuffer));
}
