import fs from "fs";
import path from "path";

export interface Meditation {
  title: string;
  description: string;
  duration: string;
  timestamp?: number;
  timeAgo: string;
  link: string;
}

const CACHE_FILE = path.join(process.cwd(), "cache", "latest-meditations.json");
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MEDITATIONS_DIR = path.join(
  process.cwd(),
  "public",
  "storage",
  "meditations"
);

export async function getLatestMeditations(
  maxCount: number = 4
): Promise<Meditation[]> {
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
    const meditationFolders = fs
      .readdirSync(MEDITATIONS_DIR, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
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
              timeAgo: getTimeAgo(stats.mtimeMs),
              link: `/m/${dirent.name}`,
            };
          } catch (error) {
            console.error(`Error parsing metadata for ${dirent.name}:`, error);
            return null;
          }
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));

    // Ensure cache directory exists
    const cacheDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Write to cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(meditationFolders));

    return meditationFolders.slice(0, maxCount);
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

function getTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "less than a minute ago";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
