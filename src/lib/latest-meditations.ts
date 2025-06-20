import fs from "fs";
import path from "path";
import { timeAgo } from "./time";
import { Meditation } from "@/components/types";

const CACHE_FILE = path.join(process.cwd(), "cache", "latest-meditations.json");
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MEDITATIONS_DIR = path.join(
  process.cwd(),
  "public",
  "storage",
  "meditations"
);
const READINGS_DIR = path.join(process.cwd(), "public", "storage", "readings");

const HIDDEN_MEDITATIONS: string[] = [
  "7c9c1rr", // hidden because user added personal info
];

export type LatestMeditation = Meditation & {
  timestamp?: number;
  timeAgo: string;
  link: string;
  type?: "meditation" | "reading";
};

/**
 * Fetches meditation data from the meditations directory
 */
function getMeditationData(): LatestMeditation[] {
  if (!fs.existsSync(MEDITATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MEDITATIONS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .filter((dirent) => !HIDDEN_MEDITATIONS.includes(dirent.name))
    .map((dirent) => {
      const folderPath = path.join(MEDITATIONS_DIR, dirent.name);
      const metadataPath = path.join(folderPath, "metadata.json");
      const stats = fs.statSync(folderPath);

      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
          return {
            ...metadata,
            timestamp: stats.mtimeMs,
            timeAgo: timeAgo(stats.mtimeMs),
            link: `/m/${dirent.name}`,
            type: "meditation" as const,
          };
        } catch (error) {
          console.error(
            `Error parsing metadata for meditation ${dirent.name}:`,
            error
          );
          return null;
        }
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Fetches reading data from the readings directory, filtered by public flag
 */
function getReadingData(): LatestMeditation[] {
  if (!fs.existsSync(READINGS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(READINGS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .filter((dirent) => dirent.name !== "_pauses") // Skip the _pauses directory
    .map((dirent) => {
      const folderPath = path.join(READINGS_DIR, dirent.name);
      const scriptPath = path.join(folderPath, "script.json");
      const stats = fs.statSync(folderPath);

      if (fs.existsSync(scriptPath)) {
        try {
          const script = JSON.parse(fs.readFileSync(scriptPath, "utf8"));

          // Only include readings that have public flag set to true
          if (script.public === true) {
            return {
              ...script,
              timestamp: stats.mtimeMs,
              timeAgo: timeAgo(stats.mtimeMs),
              link: `/r/${dirent.name}`,
              type: "reading" as const,
            };
          }
          return null;
        } catch (error) {
          console.error(
            `Error parsing script for reading ${dirent.name}:`,
            error
          );
          return null;
        }
      }
      return null;
    })
    .filter(Boolean);
}

export async function getLatestMeditations(
  maxCount: number = 6
): Promise<LatestMeditation[]> {
  try {
    // Check if cache exists and is fresh
    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE);
      const cacheAge = Date.now() - stats.mtimeMs;

      if (cacheAge < CACHE_DURATION) {
        // Cache is fresh, return cached data
        const cachedData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
        return cachedData.slice(0, maxCount);
      }
    }

    // Cache is stale or doesn't exist, generate new data
    const meditations = getMeditationData();
    const readings = getReadingData();

    // Combine both types and sort by timestamp
    const combinedData = [...meditations, ...readings].sort(
      (a, b) => (b?.timestamp || 0) - (a?.timestamp || 0)
    );

    // Ensure cache directory exists
    const cacheDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Write to cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(combinedData));

    return combinedData.slice(0, maxCount);
  } catch (error) {
    console.error("Error retrieving meditation data:", error);
    throw new Error("Failed to retrieve meditation data");
  }
}

/**
 * Flushes the meditation cache by removing the cache file.
 * This forces getLatestMeditations to regenerate the cache on next call.
 * @returns {boolean} True if cache was successfully flushed, false if there was an error
 */
export function flushMeditationCache(): boolean {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
      return true;
    }
    return false; // Cache file didn't exist
  } catch (error) {
    console.error("Error flushing meditation cache:", error);
    return false;
  }
}
