#!/usr/bin/env node

import fs from "fs";
import path from "path";
import slugify from "slugify";
import { optimizeStepsForPlayer } from "../../src/lib/reading-timings";
import { saveConcatenatedMp3 } from "../../src/lib/audio";

// Get readingId from command line arguments
const readingId = process.argv[2];

if (!readingId) {
  console.error(
    "Usage: npx tsx scripts/recreate-meditation/index.ts <readingId>"
  );
  process.exit(1);
}

async function recreateMeditation(readingId: string) {
  console.log(`Recreating meditation for reading ID: ${readingId}`);

  // Define paths
  const readingDir = path.join(
    process.cwd(),
    "public",
    "storage",
    "readings",
    readingId
  );
  const scriptPath = path.join(readingDir, "script.json");

  // Check if reading directory exists
  if (!fs.existsSync(readingDir)) {
    console.error(`Reading directory not found: ${readingDir}`);
    process.exit(1);
  }

  // Check if script.json exists
  if (!fs.existsSync(scriptPath)) {
    console.error(`Script file not found: ${scriptPath}`);
    process.exit(1);
  }

  // Read and parse script.json
  let script: any;
  try {
    const scriptContent = fs.readFileSync(scriptPath, "utf-8");
    script = JSON.parse(scriptContent);
  } catch (error) {
    console.error(`Error reading/parsing script.json: ${error}`);
    process.exit(1);
  }

  console.log(`Script title: ${script.title}`);
  console.log(`Number of steps: ${script.steps?.length || 0}`);

  // Get optimized steps for player (this filters and orders the audio files)
  const optimizedSteps = optimizeStepsForPlayer(
    script.steps,
    script.completed,
    true
  );

  // Extract audio files from optimized steps
  const audioFiles = optimizedSteps.map((step: any) => step.audio);

  console.log(`Audio files to concatenate: ${audioFiles.length}`);
  audioFiles.forEach((file: string, idx: number) => {
    console.log(`  ${idx + 1}. ${file}`);
  });

  // Convert relative paths to absolute paths
  const absoluteAudioPaths = audioFiles.map((audioPath: string) =>
    path.join(process.cwd(), "public", audioPath)
  );

  // Verify all audio files exist
  for (const audioPath of absoluteAudioPaths) {
    if (!fs.existsSync(audioPath)) {
      console.error(`Audio file not found: ${audioPath}`);
      process.exit(1);
    }
  }

  // Generate output filename (same logic as concatenateAudio function)
  const slug = slugify(script.title, { lower: true, strict: true }) || "nnn";
  const outputFilename = `${slug}.mp3`;
  const outputPath = path.join(readingDir, outputFilename);

  console.log(`Output file: ${outputPath}`);

  try {
    // Concatenate audio files
    console.log("Starting audio concatenation...");
    await saveConcatenatedMp3(absoluteAudioPaths, outputPath);
    console.log("✅ Audio concatenation completed successfully!");
    console.log(
      `Full audio recreated at: /storage/readings/${readingId}/${outputFilename}`
    );
  } catch (error) {
    console.error(`Error during audio concatenation: ${error}`);
    process.exit(1);
  }
}

// Run the script
recreateMeditation(readingId).catch((error) => {
  console.error(`Unexpected error: ${error}`);
  process.exit(1);
});
