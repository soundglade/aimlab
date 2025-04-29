/**
 * Generate speech using Test service
 * @param text Text to convert to speech
 * @param options Optional options for the service
 * @returns ArrayBuffer containing test audio data
 */
export async function generateSpeech(
  text: string,
  options?: any
): Promise<ArrayBuffer> {
  try {
    console.log(`Test service generating speech for: "${text}"`);

    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * 12000) + 1000)
    );

    // Create a simple test WAV file with a tone
    const sampleRate = 44100;
    const seconds = 1;
    const numSamples = sampleRate * seconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV header (44 bytes)
    // "RIFF" chunk
    view.setUint32(0, 0x52494646, false); // "RIFF" in ASCII
    view.setUint32(4, 36 + numSamples * 2, true); // file size - 8
    view.setUint32(8, 0x57415645, false); // "WAVE" in ASCII

    // "fmt " chunk
    view.setUint32(12, 0x666d7420, false); // "fmt " in ASCII
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, 1, true); // number of channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample

    // "data" chunk
    view.setUint32(36, 0x64617461, false); // "data" in ASCII
    view.setUint32(40, numSamples * 2, true); // data size

    // Generate a 440Hz tone (A4 note)
    const frequency = 440;
    const amplitude = 0.5; // 50% volume

    for (let i = 0; i < numSamples; i++) {
      // Generate sine wave: sin(2π * frequency * time)
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude;

      // Convert to 16-bit signed integer (-32768 to 32767)
      const sampleInt16 = Math.floor(sample * 32767);

      // Write the sample to the buffer (add offset for header)
      view.setInt16(44 + i * 2, sampleInt16, true);
    }

    console.log("Test service generated speech successfully (440Hz tone)");

    return buffer;
  } catch (error) {
    console.error("Test service error:", error);
    throw error;
  }
}
