import fetch from "node-fetch";
import fs from "fs";
import path from "path";

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  permalink: string;
  url: string;
  selftext: string;
  created_utc: number;
  score: number;
  timeAgo: string;
}

// Define types for Reddit API response
interface RedditApiResponse {
  data: {
    children: {
      data: {
        id: string;
        title: string;
        author: string;
        permalink: string;
        url: string;
        selftext: string;
        created_utc: number;
        score: number;
      };
    }[];
  };
}

const CACHE_FILE = path.join(
  process.cwd(),
  "cache",
  "latest-reddit-posts.json"
);
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function getLatestRedditPosts(
  maxCount: number = 5
): Promise<RedditPost[]> {
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

    // Cache is stale or doesn't exist, fetch new data
    const response = await fetch(
      "https://www.reddit.com/r/AIMeditationLab/best.json"
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Reddit posts: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as RedditApiResponse;

    const posts = data.data.children.map((child) => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title,
        author: post.author,
        permalink: `https://www.reddit.com${post.permalink}`,
        url: post.url,
        selftext: post.selftext,
        created_utc: post.created_utc * 1000, // Convert to milliseconds
        score: post.score,
        timeAgo: getTimeAgo(post.created_utc * 1000),
      };
    });

    // Ensure cache directory exists
    const cacheDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Write to cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(posts));

    return posts.slice(0, maxCount);
  } catch (error) {
    console.error("Error retrieving Reddit posts:", error);
    return []; // Return empty array instead of throwing to prevent page failure
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
