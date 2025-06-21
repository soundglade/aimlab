import { describe, it, expect } from "vitest";
import { randomMp3Name } from "@/lib/reading-synthesizer";

describe("randomMp3Name", () => {
  it("should return a string ending with .mp3", () => {
    const name = randomMp3Name("This is a test sentence for the mp3 filename");
    expect(typeof name).toBe("string");
    expect(name.endsWith(".mp3")).toBe(true);
  });

  it("should use the first 8 words as the slug", () => {
    const input = "One two three four five six seven eight nine ten";
    const name = randomMp3Name(input);
    // The slug should be based on the first 8 words
    expect(name.startsWith("one-two-three-four-five-six-seven-eight-")).toBe(
      true
    );
  });

  it("should strip invalid characters", () => {
    const input =
      "++@@@!!! çrãzŸ)))   ^^^ test~~~ mañŷ symbølß   123```²³⁴   ♠♥♦♣   →↓←↑   ☺☻♥♦♣   αβγδε   ¿¡   çñ   π∞√∆≤≥≠±   {}|[]";
    const name = randomMp3Name(input);
    expect(name.startsWith("crazy-test-many-symbolss-123-love-")).toBe(true);
  });

  it("should not use a completely empty slug", () => {
    const input = "想象自己站在柔软的云层上。";
    const name = randomMp3Name(input);
    console.log({ name });
    expect(name.startsWith("nnn-")).toBe(true);
  });

  it("should generate different filenames for the same input (randomness)", () => {
    const input = "Repeatable input for randomness test";
    const name1 = randomMp3Name(input);
    const name2 = randomMp3Name(input);
    expect(name1).not.toBe(name2);
  });
});
