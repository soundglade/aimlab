import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { timeAgo } from "./time";
import {
  parseRedditMedia,
  RedditPostMedia,
  RedditApiPost,
} from "./reddit-media";

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
  media?: RedditPostMedia;
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
      } & RedditApiPost;
    }[];
  };
}

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

const CACHE_FILE = path.join(
  process.cwd(),
  "cache",
  "latest-reddit-posts.json"
);
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Reddit API credentials
const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USERNAME = process.env.REDDIT_USERNAME;
const PASSWORD = process.env.REDDIT_PASSWORD;
const USER_AGENT =
  process.env.REDDIT_USER_AGENT || "nodejs:aimlab:v1.0 (by /u/valatw)";

// Get OAuth token for Reddit API
async function getRedditToken(): Promise<string> {
  try {
    const authorization = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body: `grant_type=password&username=${USERNAME}&password=${PASSWORD}`,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get Reddit token: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as RedditTokenResponse;
    return data.access_token;
  } catch (error) {
    console.error("Error getting Reddit OAuth token:", error);
    throw error;
  }
}

export async function getLatestRedditPosts(
  maxCount: number = 3
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
    // Get OAuth token first
    const token = await getRedditToken();

    const response = await fetch(
      "https://oauth.reddit.com/r/AIMeditationLab/best",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Reddit posts: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as RedditApiResponse;

    const posts = data.data.children.map((child) => {
      const post = child.data;
      const media = parseRedditMedia(post);

      return {
        id: post.id,
        title: post.title,
        author: post.author,
        permalink: `https://www.reddit.com${post.permalink}`,
        url: post.url,
        selftext: post.selftext,
        created_utc: post.created_utc * 1000, // Convert to milliseconds
        score: post.score,
        timeAgo: timeAgo(post.created_utc * 1000),
        media,
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
