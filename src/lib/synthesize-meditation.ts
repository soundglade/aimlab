import {
  generateSpeech,
  SpeechService,
  getAudioDurationMs,
} from "@/lib/speech";
import { Meditation } from "@/components/types";
import { addTimelineToMeditation } from "@/components/utils/meditation-timeline";
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
    voiceId = "drew",
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
    // Determine which speech service to use and how to call it
    const isTest = voiceId === "test";
    const isKokoro = voiceId === "nicole";
    const isElevenLabs = !isTest && !isKokoro;

    const speechService: SpeechService = isTest
      ? "test"
      : isKokoro
      ? "replicateKokoro"
      : "elevenlabs";

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

    // Phase 1: Generate speech for all steps in parallel
    try {
      let completedSteps = 0;
      const speechGenerationPromises = speechSteps.map(async (step) => {
        const stepIndex = meditation.steps.indexOf(step);

        let audioBuffer: ArrayBuffer;
        if (speechService === "elevenlabs") {
          audioBuffer = await speechGenerator(step.text, "elevenlabs", voiceId);
        } else {
          audioBuffer = await speechGenerator(step.text, speechService);
        }
        const durationMs = await durationCalculator(audioBuffer);

        // Increment completed steps and update progress
        completedSteps += 1;
        onProgress(calculateProgress(completedSteps, totalSteps, "speech"));

        return {
          stepIndex,
          audioBuffer,
          durationMs,
        };
      });

      const results = await Promise.all(speechGenerationPromises);

      // Process results and update meditation steps
      for (const { stepIndex, audioBuffer, durationMs } of results) {
        audioBuffers.set(stepIndex, audioBuffer);
        meditation.steps[stepIndex].durationMs = durationMs;
      }
    } catch (err) {
      onError(
        `Failed to generate audio: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return false;
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
