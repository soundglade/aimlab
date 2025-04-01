import { synthesizeMeditation } from "../../src/lib/synthesize-meditation";
import { Meditation, MeditationStep } from "../../src/components/types";

async function runTest() {
  console.log("Starting synthesize-meditation test...");

  // Create a simple test meditation
  const config = {
    numSpeechSteps: 20,
    pauseDuration: 5,
  };

  const generateTestSteps = (numSteps: number): MeditationStep[] => {
    const steps: MeditationStep[] = [];
    for (let i = 0; i < numSteps; i++) {
      // Add speech step
      steps.push({
        type: "speech",
        text:
          i === 0
            ? "Welcome to this test meditation. Take a deep breath."
            : i === numSteps - 1
            ? "Thank you for participating in this test meditation."
            : `This is meditation step ${i + 1}. Continue breathing deeply.`,
      });

      // Add pause after each speech step except the last
      if (i < numSteps - 1) {
        steps.push({
          type: "pause",
          duration: config.pauseDuration,
        });
      }
    }
    return steps;
  };

  const testMeditation: Meditation = {
    title: "Test Meditation",
    steps: generateTestSteps(config.numSpeechSteps),
  };

  // Test callbacks
  const onProgress = (progress: number) => {
    console.log(`Progress: ${progress}%`);
  };

  const onComplete = (
    success: boolean,
    audioBuffer?: Buffer,
    updatedMeditation?: Meditation
  ) => {
    console.log(`Synthesis completed, success: ${success}`);
    if (audioBuffer) {
      console.log(`Audio buffer size: ${audioBuffer.byteLength} bytes`);
    }
    if (updatedMeditation) {
      console.log(
        "Updated meditation with timeline:",
        updatedMeditation.timeline
      );
    }
  };

  const onError = (message: string) => {
    console.error(`Error: ${message}`);
  };

  // Run the synthesis function
  const result = await synthesizeMeditation(testMeditation, {
    voiceId: "test",
    onProgress,
    onComplete,
    onError,
  });

  console.log(`Synthesis function returned: ${result}`);
}

// Execute the test
runTest().catch((error) => {
  console.error("Test failed with error:", error);
});
