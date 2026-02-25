export type RedditImage = {
  url: string;
  width?: number;
  height?: number;
};

export type RedditVideo = {
  fallbackUrl?: string;
  hlsUrl?: string;
  dashUrl?: string;
  hasAudio?: boolean;
  isGif?: boolean;
  width?: number;
  height?: number;
  poster?: string;
};

export type RedditPostMedia =
  | { type: "image"; image: RedditImage }
  | { type: "gallery"; images: RedditImage[] }
  | { type: "video"; video: RedditVideo };

export interface RedditApiPost {
  is_video?: boolean;
  is_gallery?: boolean;
  post_hint?: string | null;
  is_reddit_media_domain?: boolean;
  domain?: string;
  url_overridden_by_dest?: string;
  preview?: {
    images?: Array<{
      source?: {
        url?: string;
        width?: number;
        height?: number;
      };
    }>;
  };
  gallery_data?: {
    items?: Array<{
      media_id?: string;
    }>;
  };
  media_metadata?: Record<
    string,
    {
      status?: string;
      s?: { u?: string; x?: number; y?: number };
      p?: Array<{ u?: string; x?: number; y?: number }>;
    }
  >;
  secure_media?: {
    reddit_video?: {
      fallback_url?: string;
      hls_url?: string;
      dash_url?: string;
      has_audio?: boolean;
      is_gif?: boolean;
      width?: number;
      height?: number;
    };
  };
  media?: {
    reddit_video?: {
      fallback_url?: string;
      hls_url?: string;
      dash_url?: string;
      has_audio?: boolean;
      is_gif?: boolean;
      width?: number;
      height?: number;
    };
  };
}

const REDDIT_IMAGE_HOSTS = new Set(["i.redd.it", "preview.redd.it"]);

function isRedditImageHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return REDDIT_IMAGE_HOSTS.has(host);
  } catch {
    return false;
  }
}

function isDirectImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
}

export function decodeRedditUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function getPreviewImage(post: RedditApiPost): RedditImage | undefined {
  const source = post.preview?.images?.[0]?.source;
  const url = decodeRedditUrl(source?.url);
  if (!url) return undefined;
  return {
    url,
    width: source?.width,
    height: source?.height,
  };
}

export function getGalleryImages(post: RedditApiPost): RedditImage[] {
  const items = post.gallery_data?.items;
  const metadata = post.media_metadata;
  if (!items || !metadata) return [];

  return items.reduce<RedditImage[]>((images, item) => {
    const mediaId = item.media_id;
    if (!mediaId) return images;
    const entry = metadata[mediaId];
    if (!entry || entry.status !== "valid") return images;
    const source = entry.s ?? entry.p?.[entry.p.length - 1];
    const url = decodeRedditUrl(source?.u);
    if (!url) return images;
    images.push({
      url,
      width: source?.x,
      height: source?.y,
    });
    return images;
  }, []);
}

function getRedditVideoIdFromUrl(url?: string): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "v.redd.it") return undefined;
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments[0];
  } catch {
    return undefined;
  }
}

export function deriveRedditHlsUrl(fallbackUrl?: string): string | undefined {
  const videoId = getRedditVideoIdFromUrl(fallbackUrl);
  if (!videoId) return undefined;
  return `https://v.redd.it/${videoId}/HLSPlaylist.m3u8`;
}

export function deriveRedditDashUrl(fallbackUrl?: string): string | undefined {
  const videoId = getRedditVideoIdFromUrl(fallbackUrl);
  if (!videoId) return undefined;
  return `https://v.redd.it/${videoId}/DASHPlaylist.mpd`;
}

export function getVideo(post: RedditApiPost): RedditVideo | undefined {
  const redditVideo =
    post.secure_media?.reddit_video ?? post.media?.reddit_video;
  if (!post.is_video || !redditVideo) return undefined;

  const fallbackUrl = decodeRedditUrl(redditVideo.fallback_url);
  const hlsUrl =
    decodeRedditUrl(redditVideo.hls_url) ?? deriveRedditHlsUrl(fallbackUrl);
  const dashUrl =
    decodeRedditUrl(redditVideo.dash_url) ?? deriveRedditDashUrl(fallbackUrl);
  if (!fallbackUrl && !hlsUrl && !dashUrl) return undefined;

  const poster = getPreviewImage(post)?.url;
  return {
    fallbackUrl,
    hlsUrl,
    dashUrl,
    hasAudio: redditVideo.has_audio,
    isGif: redditVideo.is_gif,
    width: redditVideo.width,
    height: redditVideo.height,
    poster,
  };
}

export function parseRedditMedia(
  post: RedditApiPost
): RedditPostMedia | undefined {
  const video = getVideo(post);
  if (video) {
    return { type: "video", video };
  }

  if (post.is_gallery) {
    const images = getGalleryImages(post);
    if (images.length > 0) {
      return { type: "gallery", images };
    }
  }

  const preview = getPreviewImage(post);
  const overrideUrl = decodeRedditUrl(post.url_overridden_by_dest);
  const canUsePreview =
    preview &&
    (post.post_hint === "image" || post.is_reddit_media_domain === true);
  const canUseOverride =
    overrideUrl && isDirectImageUrl(overrideUrl) && isRedditImageHost(overrideUrl);

  if (canUsePreview) {
    return { type: "image", image: preview };
  }

  if (canUseOverride) {
    return { type: "image", image: { url: overrideUrl } };
  }

  return undefined;
}
