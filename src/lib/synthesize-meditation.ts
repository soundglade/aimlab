import { generateSpeech, getAudioDurationMs } from "@/lib/speech";
import { Meditation } from "@/components/rila/types";

export async function synthesizeMeditation(
  meditation: Meditation,
  {
    speechGenerator = generateSpeech,
    durationCalculator = getAudioDurationMs,
    onProgress = (progress: number) => {},
    onComplete = (success: boolean) => {},
    onError = (message: string) => {},
  } = {}
) {
  try {
    const speechSteps = meditation.steps.filter(
      (step) => step.type === "speech"
    );
    const totalSteps = speechSteps.length;

    const calculateProgress = (current, total) => {
      return Math.round((current / total) * 100);
    };

    onProgress(0);

    for (let i = 0; i < totalSteps; i++) {
      const step = speechSteps[i];
      onProgress(calculateProgress(i, totalSteps));

      try {
        const audioBuffer = await speechGenerator(step.text);
        await durationCalculator(audioBuffer);
        onProgress(calculateProgress(i + 1, totalSteps));
      } catch (err) {
        onError(`Failed to generate audio for section ${i + 1}`);
        return false;
      }
    }

    onComplete(true);
    return true;
  } catch (error) {
    onError("Synthesis failed");
    return false;
  }
}
