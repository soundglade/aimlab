import { describe, it, expect, vi } from "vitest";
import { synthesizeMeditation } from "@/pages/api/synthesize-meditation";

describe("synthesizeMeditation", () => {
  // Mock speech functions
  const mockSpeechGenerator = vi.fn().mockResolvedValue(new ArrayBuffer(10));
  const mockDurationCalculator = vi.fn().mockResolvedValue(3000);

  // Test data
  const testSteps = [
    { type: "speech", text: "Welcome to meditation" },
    { type: "speech", text: "Take a deep breath" },
    { type: "other", text: "Not a speech step" },
    { type: "speech", text: "Relax your body" },
  ];

  it("should process all speech steps and report progress", async () => {
    const progressUpdates: number[] = [];
    const onProgress = (progress: number) => progressUpdates.push(progress);
    const onComplete = vi.fn();
    const onError = vi.fn();

    const result = await synthesizeMeditation(testSteps, {
      speechGenerator: mockSpeechGenerator,
      durationCalculator: mockDurationCalculator,
      onProgress,
      onComplete,
      onError,
    });

    // Should return true for successful completion
    expect(result).toBe(true);

    // Should call speech generator for each speech step
    expect(mockSpeechGenerator).toHaveBeenCalledTimes(3);
    expect(mockSpeechGenerator).toHaveBeenCalledWith("Welcome to meditation");
    expect(mockSpeechGenerator).toHaveBeenCalledWith("Take a deep breath");
    expect(mockSpeechGenerator).toHaveBeenCalledWith("Relax your body");

    // Should call duration calculator for each speech step
    expect(mockDurationCalculator).toHaveBeenCalledTimes(3);

    // Should report progress correctly
    expect(progressUpdates).toContain(0); // Initial progress
    expect(progressUpdates).toContain(33); // After first step (1/3)
    expect(progressUpdates).toContain(67); // After second step (2/3)
    expect(progressUpdates).toContain(100); // After third step (3/3)

    // Should call onComplete with success
    expect(onComplete).toHaveBeenCalledWith(true);

    // Should not call onError
    expect(onError).not.toHaveBeenCalled();
  });

  it("should handle errors during speech generation", async () => {
    const failingSpeechGenerator = vi
      .fn()
      .mockResolvedValueOnce(new ArrayBuffer(10)) // First call succeeds
      .mockRejectedValueOnce(new Error("Speech generation failed")); // Second call fails

    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    const result = await synthesizeMeditation(testSteps, {
      speechGenerator: failingSpeechGenerator,
      durationCalculator: mockDurationCalculator,
      onProgress,
      onComplete,
      onError,
    });

    // Should return false for failed completion
    expect(result).toBe(false);

    // Should call speech generator until it fails
    expect(failingSpeechGenerator).toHaveBeenCalledTimes(2);

    // Should call onError with appropriate message
    expect(onError).toHaveBeenCalledWith(
      "Failed to generate audio for section 2"
    );

    // Should not call onComplete
    expect(onComplete).not.toHaveBeenCalled();
  });
});
