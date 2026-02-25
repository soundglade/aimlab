import React from "react";
import Link from "next/link";
import {
  deriveRedditHlsUrl,
  type RedditPostMedia,
} from "@/lib/reddit-media";

function getAspectRatioStyle(width?: number, height?: number) {
  if (!width || !height) return undefined;
  return { aspectRatio: `${width} / ${height}` };
}

export function RedditPostMedia({
  media,
  permalink,
}: {
  media?: RedditPostMedia;
  permalink: string;
}) {
  if (!media) return null;

  if (media.type === "image") {
    return (
      <div className="mt-3">
        <Link href={permalink} target="_blank" className="block">
          <img
            src={media.image.url}
            alt="Reddit post image"
            loading="lazy"
            decoding="async"
            className="w-full max-h-[200px] rounded-lg border-2 border-border object-cover"
            style={getAspectRatioStyle(media.image.width, media.image.height)}
          />
        </Link>
      </div>
    );
  }

  if (media.type === "gallery") {
    const firstImage = media.images[0];
    if (!firstImage) return null;
    return (
      <div className="mt-3">
        <Link href={permalink} target="_blank" className="block">
          <img
            src={firstImage.url}
            alt="Reddit gallery image"
            loading="lazy"
            decoding="async"
            className="w-full max-h-[200px] rounded-lg border-2 border-border object-cover"
            style={getAspectRatioStyle(firstImage.width, firstImage.height)}
          />
        </Link>
      </div>
    );
  }

  if (media.type === "video") {
    const preferredSrc =
      media.video.hlsUrl ??
      deriveRedditHlsUrl(media.video.fallbackUrl) ??
      media.video.fallbackUrl;

    return (
      <div className="mt-3">
        <video
          controls
          playsInline
          preload="metadata"
          poster={media.video.poster}
          className="w-full max-h-[200px] rounded-lg border-2 border-border"
        >
          {preferredSrc && (
            <source
              src={preferredSrc}
              type={
                preferredSrc.endsWith(".m3u8")
                  ? "application/x-mpegURL"
                  : "video/mp4"
              }
            />
          )}
          {media.video.fallbackUrl && preferredSrc !== media.video.fallbackUrl && (
            <source src={media.video.fallbackUrl} type="video/mp4" />
          )}
        </video>
      </div>
    );
  }

  return null;
}
