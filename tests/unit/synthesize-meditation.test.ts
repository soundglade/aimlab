import { describe, it, expect, vi, beforeEach } from "vitest";
import { synthesizeMeditation } from "@/lib/synthesize-meditation";
import { Meditation } from "@/components/types";

describe("synthesizeMeditation", () => {
  // Mock functions
  const mockSpeechGenerator = vi.fn().mockResolvedValue(new ArrayBuffer(10));
  const mockDurationCalculator = vi.fn().mockResolvedValue(3000);
  const mockAudioConcatenator = vi
    .fn()
    .mockResolvedValue(Buffer.from("mock-wav-data"));

  // Test data factory
  const createTestMeditation = (): Meditation => ({
    title: "Test Meditation",
    steps: [
      { type: "speech", text: "Welcome to meditation" },
      { type: "speech", text: "Take a deep breath" },
      { type: "pause", duration: 5 },
      { type: "speech", text: "Relax your body" },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process speech steps and update the meditation with timeline", async () => {
    const meditation = createTestMeditation();
    const onComplete = vi.fn();

    const result = await synthesizeMeditation(meditation, {
      speechGenerator: mockSpeechGenerator,
      durationCalculator: mockDurationCalculator,
      audioConcatenator: mockAudioConcatenator,
      onComplete,
    });

    // Verify core functionality
    expect(result).toBe(true);
    expect(mockSpeechGenerator).toHaveBeenCalledTimes(3);
    expect(mockAudioConcatenator).toHaveBeenCalledTimes(1);

    // Verify meditation was updated with durations
    const speechSteps = meditation.steps.filter(
      (step) => step.type === "speech"
    );
    speechSteps.forEach((step) => expect(step.durationMs).toBe(3000));

    // Verify onComplete was called with the right parameters
    expect(onComplete).toHaveBeenCalledWith(
      true,
      expect.any(Buffer),
      expect.objectContaining({
        timeline: expect.objectContaining({
          timings: expect.any(Array),
          totalDurationMs: expect.any(Number),
        }),
      })
    );
  });

  it("should handle speech generation errors", async () => {
    const failingSpeechGenerator = vi
      .fn()
      .mockRejectedValue(new Error("Speech error"));
    const onError = vi.fn();

    const result = await synthesizeMeditation(createTestMeditation(), {
      speechGenerator: failingSpeechGenerator,
      durationCalculator: mockDurationCalculator,
      audioConcatenator: mockAudioConcatenator,
      onError,
    });

    expect(result).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining("Failed to generate audio")
    );
  });

  it("should handle audio concatenation errors", async () => {
    const failingAudioConcatenator = vi
      .fn()
      .mockRejectedValue(new Error("Concatenation error"));
    const onError = vi.fn();

    const result = await synthesizeMeditation(createTestMeditation(), {
      speechGenerator: mockSpeechGenerator,
      durationCalculator: mockDurationCalculator,
      audioConcatenator: failingAudioConcatenator,
      onError,
    });

    expect(result).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining("Failed to concatenate audio")
    );
  });

  it("should create a proper timeline with correct structure", async () => {
    let capturedMeditation: Meditation | undefined;

    await synthesizeMeditation(createTestMeditation(), {
      speechGenerator: mockSpeechGenerator,
      durationCalculator: mockDurationCalculator,
      audioConcatenator: mockAudioConcatenator,
      onComplete: (_, __, meditation) => {
        capturedMeditation = meditation;
      },
    });

    // Verify timeline structure
    const timeline = capturedMeditation?.timeline;
    expect(timeline).toBeDefined();

    // Check for speech and pause timings
    const timingTypes = timeline?.timings.map((t) => t.type);
    expect(timingTypes).toContain("speech");
    expect(timingTypes).toContain("pause");

    // Verify timing properties exist
    const timing = timeline?.timings[0];
    expect(timing).toMatchObject({
      startTimeMs: expect.any(Number),
      endTimeMs: expect.any(Number),
      durationMs: expect.any(Number),
    });
  });
});
