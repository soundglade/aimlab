import { generateSpeech, getAudioDurationMs } from "@/lib/speech";
import { Meditation } from "@/components/rila/types";
import { addTimelineToMeditation } from "@/components/rila/utils/meditation-timeline";
import { createConcatenatedAudio } from "@/lib/audio";

// Progress allocation constants
const SPEECH_GENERATION_PROGRESS_PERCENTAGE = 50;
const AUDIO_CONCATENATION_PROGRESS_PERCENTAGE = 50;

export async function synthesizeMeditation(
  meditation: Meditation,
  {
    speechGenerator = generateSpeech,
    durationCalculator = getAudioDurationMs,
    audioConcatenator = createConcatenatedAudio,
    voiceId = "nicole",
    onProgress = (progress: number) => {},
    onComplete = (
      success: boolean,
      audioBuffer?: Buffer,
      updatedMeditation?: Meditation
    ) => {},
    onError = (message: string) => {},
  } = {}
) {
  try {
    const speechService = voiceId === "nicole" ? "kokoro" : "elevenlabs";
    const speechSteps = meditation.steps.filter(
      (step) => step.type === "speech"
    );
    const totalSteps = speechSteps.length;
    const audioBuffers = new Map<number, ArrayBuffer>();

    const calculateProgress = (current, total, phase) => {
      const percentage =
        phase === "speech"
          ? SPEECH_GENERATION_PROGRESS_PERCENTAGE
          : AUDIO_CONCATENATION_PROGRESS_PERCENTAGE;

      const phaseProgress = Math.round((current / total) * 100);

      if (phase === "speech") {
        return Math.round((phaseProgress * percentage) / 100);
      } else {
        return (
          SPEECH_GENERATION_PROGRESS_PERCENTAGE +
          Math.round((phaseProgress * percentage) / 100)
        );
      }
    };

    onProgress(0);

    // Phase 1: Generate speech for each step
    for (let i = 0; i < totalSteps; i++) {
      const step = speechSteps[i];
      const stepIndex = meditation.steps.indexOf(step);
      onProgress(calculateProgress(i, totalSteps, "speech"));

      try {
        const audioBuffer = await speechGenerator(step.text, speechService);
        audioBuffers.set(stepIndex, audioBuffer);

        // Update step with duration
        const durationMs = await durationCalculator(audioBuffer);
        meditation.steps[stepIndex].durationMs = durationMs;
      } catch (err) {
        onError(`Failed to generate audio for section ${i + 1}`);
        return false;
      }
    }

    // Phase 2: Create timeline and concatenate audio
    try {
      // Add timeline to meditation
      const meditationWithTimeline = addTimelineToMeditation(meditation);

      if (!meditationWithTimeline.timeline) {
        throw new Error("Failed to create timeline for meditation");
      }

      // Create final WAV buffer based on timeline
      const wavBuffer = await audioConcatenator(
        audioBuffers,
        meditationWithTimeline.timeline,
        (progress) => {
          onProgress(calculateProgress(progress, 100, "audio"));
        }
      );

      onComplete(true, wavBuffer, meditationWithTimeline);
      return true;
    } catch (err) {
      onError(
        `Failed to concatenate audio: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return false;
    }
  } catch (error) {
    console.error("Synthesis error:", error);
    onError("Synthesis failed");
    return false;
  }
}
