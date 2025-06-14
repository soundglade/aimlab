import dotenv from "dotenv";
dotenv.config();

import { generateSpeech } from "../../src/lib/services/self-hosted-kokoro";
import { VOICES } from "../../src/components/instant/voice-select";
import { generateSilentMp3, saveConcatenatedMp3 } from "../../src/lib/audio";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Polyfill fetch for Node.js if needed
// @ts-ignore
if (typeof fetch === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  globalThis.fetch = require("node-fetch");
}

// Sample texts for each supported language - meditation-focused content
// Each language has pre-split sentences to avoid issues with non-Roman punctuation
const SAMPLE_TEXTS: Record<string, string[]> = {
  en: [
    "Find a comfortable sitting position, whether on a chair, cushion, or directly on the ground",
    "Allow your body to settle into this space, feeling supported by the earth beneath you",
    "Take a moment to gently close your eyes or lower your gaze, preparing for a journey inward",
  ],

  es: [
    "Encuentra una posición cómoda para sentarte, ya sea en una silla, cojín, o directamente en el suelo",
    "Permite que tu cuerpo se asiente en este espacio, sintiéndote apoyado por la tierra debajo de ti",
    "Tómate un momento para cerrar suavemente los ojos o bajar la mirada, preparándote para un viaje hacia adentro",
  ],

  pt: [
    "Encontre uma posição confortável para se sentar, seja numa cadeira, almofada, ou diretamente no chão",
    "Permita que seu corpo se acomode neste espaço, sentindo-se apoiado pela terra abaixo de você",
    "Reserve um momento para fechar suavemente os olhos ou baixar o olhar, preparando-se para uma jornada interior",
  ],

  fr: [
    "Trouvez une position assise confortable, que ce soit sur une chaise, un coussin, ou directement sur le sol",
    "Laissez votre corps s'installer dans cet espace, en vous sentant soutenu par la terre sous vous",
    "Prenez un moment pour fermer doucement les yeux ou baisser le regard, vous préparant pour un voyage intérieur",
  ],

  it: [
    "Trova una posizione seduta comoda, che sia su una sedia, un cuscino, o direttamente sul pavimento",
    "Permetti al tuo corpo di sistemarsi in questo spazio, sentendoti sostenuto dalla terra sotto di te",
    "Prenditi un momento per chiudere dolcemente gli occhi o abbassare lo sguardo, preparandoti per un viaggio interiore",
  ],

  ja: [
    "椅子でも、クッションでも、床に直接でも、快適な座る姿勢を見つけてください",
    "あなたの体がこの空間に落ち着き、足元の大地に支えられていることを感じてください",
    "目を優しく閉じるか視線を下げて、内なる旅への準備をする時間を取ってください",
  ],

  zh: [
    "找到一个舒适的坐姿，无论是在椅子上、垫子上，还是直接坐在地上",
    "让你的身体安定在这个空间里，感受脚下大地的支撑",
    "花一点时间轻轻闭上眼睛或垂下目光，为内心的旅程做好准备",
  ],

  hi: [
    "एक आरामदायक बैठने की स्थिति खोजें, चाहे वह कुर्सी पर हो, तकिए पर हो, या सीधे जमीन पर हो",
    "अपने शरीर को इस स्थान में स्थिर होने दें, अपने नीचे की पृथ्वी द्वारा समर्थित महसूस करें",
    "अपनी आंखें धीरे से बंद करने या अपनी नज़र नीची करने के लिए एक क्षण लें, अंतर्मुखी यात्रा की तैयारी करते हुए",
  ],
};

const SILENCE_DURATION_SECONDS = 2;
const PUBLIC_DIR = path.resolve("public");

/**
 * Get sample sentences for a specific language
 */
function getSampleSentencesForLanguage(languageCode: string): string[] {
  return SAMPLE_TEXTS[languageCode] || SAMPLE_TEXTS.en;
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the duration of an audio file in seconds using ffprobe
 */
async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const ffprobePath = process.env.FFPROBE_PATH || "/usr/bin/ffprobe";
    const { stdout } = await execAsync(
      `"${ffprobePath}" -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.warn(`Could not get duration for ${filePath}:`, error);
    return 0;
  }
}

async function main() {
  console.log(`Generating voice previews for ${VOICES.length} voices...`);

  // Ensure the assets directory exists
  const assetsDir = path.join(PUBLIC_DIR, "assets");
  await fs.mkdir(assetsDir, { recursive: true });

  for (const voice of VOICES) {
    console.log(
      `Generating preview for ${voice.name} (${voice.id}) - Language: ${voice.language}...`
    );

    // Check if the preview file already exists
    const fileName = path.basename(voice.previewFile);
    const outputPath = path.join(assetsDir, fileName);

    if (await fileExists(outputPath)) {
      console.log(`  ✓ Preview already exists for ${voice.name}, skipping...`);
      continue;
    }

    // Get the appropriate sample sentences for this voice's language
    const sentences = getSampleSentencesForLanguage(voice.language);
    console.log(
      `  Sample sentences for ${voice.language}: ${sentences.length} sentences`
    );

    try {
      // Create a temporary directory for this voice's segments
      const tmpDir = await fs.mkdtemp(
        path.join(os.tmpdir(), `voice-preview-${voice.id}-`)
      );

      const segmentPaths: string[] = [];

      try {
        // Generate each sentence as a separate MP3 file
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          console.log(
            `  Generating sentence ${i + 1}/${sentences.length} for ${
              voice.name
            }: "${sentence}"`
          );

          // Generate speech for this sentence
          const audioBuffer = await generateSpeech(sentence, {
            voiceId: voice.id,
          });

          // Save sentence audio to temporary file
          const sentenceFile = path.join(tmpDir, `sentence-${i}.mp3`);
          const buffer = Buffer.from(audioBuffer);
          await fs.writeFile(sentenceFile, buffer);
          segmentPaths.push(sentenceFile);

          // Get and log the duration of the sentence audio
          const sentenceDuration = await getAudioDuration(sentenceFile);
          console.log(
            `    Added sentence file: ${path.basename(
              sentenceFile
            )} (${sentenceDuration.toFixed(2)}s)`
          );

          // Add silence after this sentence (except for the last one)
          if (i < sentences.length - 1) {
            const silenceFile = path.join(tmpDir, `silence-${i}.mp3`);
            const silenceDuration = SILENCE_DURATION_SECONDS + i; // Increase by 1 second for each silence
            console.log(
              `    Generating ${silenceDuration}s silence: ${path.basename(
                silenceFile
              )}`
            );
            await generateSilentMp3(silenceDuration, silenceFile);

            // Verify the silence file was created and has content
            const silenceStats = await fs.stat(silenceFile);
            const actualSilenceDuration = await getAudioDuration(silenceFile);
            console.log(`    Silence file size: ${silenceStats.size} bytes`);

            segmentPaths.push(silenceFile);
            console.log(
              `    Added silence file: ${path.basename(
                silenceFile
              )} (expected: ${silenceDuration}s, actual: ${actualSilenceDuration.toFixed(
                2
              )}s)`
            );
          }
        }

        // Log the final segment order
        console.log(`  Final segment order for ${voice.name}:`);
        segmentPaths.forEach((segmentPath, index) => {
          console.log(`    ${index + 1}. ${path.basename(segmentPath)}`);
        });

        // outputPath is already calculated above for file existence check

        // Concatenate all segments into the final preview file
        console.log(
          `  Concatenating ${segmentPaths.length} segments for ${voice.name}...`
        );

        // Verify all segment files exist before concatenation and calculate total expected duration
        let totalExpectedDuration = 0;
        for (const segmentPath of segmentPaths) {
          const stats = await fs.stat(segmentPath);
          const duration = await getAudioDuration(segmentPath);
          totalExpectedDuration += duration;
          console.log(
            `    Segment ${path.basename(segmentPath)}: ${
              stats.size
            } bytes, ${duration.toFixed(2)}s`
          );
        }
        console.log(
          `    Total expected duration: ${totalExpectedDuration.toFixed(2)}s`
        );

        await saveConcatenatedMp3(segmentPaths, outputPath);

        // Verify the final output file
        const finalStats = await fs.stat(outputPath);
        const finalDuration = await getAudioDuration(outputPath);
        console.log(
          `    Final output: ${finalStats.size} bytes, ${finalDuration.toFixed(
            2
          )}s`
        );
        console.log(
          `    Duration comparison - Expected: ${totalExpectedDuration.toFixed(
            2
          )}s, Actual: ${finalDuration.toFixed(2)}s, Difference: ${Math.abs(
            totalExpectedDuration - finalDuration
          ).toFixed(2)}s`
        );

        console.log(`✓ Saved ${voice.name} preview: ${outputPath}`);
      } finally {
        // Cleanup temporary directory
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`✗ Error generating preview for ${voice.name}:`, error);
    }
  }

  console.log("Voice preview generation complete!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
