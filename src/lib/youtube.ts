const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const INSTAGRAM_MEDIA_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export type VideoProvider = "youtube" | "instagram";

export interface ParsedVideoUrl {
  aspectClassName: string;
  embedUrl: string;
  normalizedUrl: string;
  provider: VideoProvider;
  title: string;
  videoId: string;
}

export interface ParsedYouTubeUrl extends ParsedVideoUrl {
  provider: "youtube";
}

function isValidYouTubeVideoId(value: string) {
  return YOUTUBE_VIDEO_ID_PATTERN.test(value);
}

function isValidInstagramMediaId(value: string) {
  return INSTAGRAM_MEDIA_ID_PATTERN.test(value);
}

function getLastPathSegment(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : "";
}

function parseYouTubeVideoUrl(url: URL): ParsedYouTubeUrl | null {
  const hostname = url.hostname.toLowerCase();
  let videoId = "";

  if (hostname === "youtu.be") {
    videoId = getLastPathSegment(url.pathname);
  } else if (
    hostname === "youtube.com" ||
    hostname === "www.youtube.com" ||
    hostname === "m.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v")?.trim() ?? "";
    } else if (url.pathname.startsWith("/embed/")) {
      videoId = getLastPathSegment(url.pathname);
    }
  }

  if (!isValidYouTubeVideoId(videoId)) {
    return null;
  }

  return {
    aspectClassName: "aspect-video",
    provider: "youtube",
    title: "YouTube",
    videoId,
    normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}

function parseInstagramVideoUrl(url: URL): ParsedVideoUrl | null {
  const hostname = url.hostname.toLowerCase();

  if (
    hostname !== "instagram.com" &&
    hostname !== "www.instagram.com" &&
    hostname !== "m.instagram.com"
  ) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const mediaType = segments[0];
  const mediaId = segments[1]?.trim() ?? "";

  if (
    (mediaType !== "reel" && mediaType !== "p") ||
    !isValidInstagramMediaId(mediaId)
  ) {
    return null;
  }

  return {
    aspectClassName: mediaType === "reel" ? "aspect-[9/16]" : "aspect-square",
    provider: "instagram",
    title: mediaType === "reel" ? "Instagram Reel" : "Instagram Post",
    videoId: mediaId,
    normalizedUrl: `https://www.instagram.com/${mediaType}/${mediaId}/`,
    embedUrl: `https://www.instagram.com/${mediaType}/${mediaId}/embed`,
  };
}

export function parseVideoUrl(value: string): ParsedVideoUrl | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  return parseYouTubeVideoUrl(url) ?? parseInstagramVideoUrl(url);
}

export function normalizeVideoUrl(value: string) {
  const parsed = parseVideoUrl(value);
  return parsed?.normalizedUrl ?? null;
}

export function parseYouTubeUrl(value: string): ParsedYouTubeUrl | null {
  const parsed = parseVideoUrl(value);
  return parsed?.provider === "youtube" ? (parsed as ParsedYouTubeUrl) : null;
}

export function normalizeYouTubeUrl(value: string) {
  const parsed = parseYouTubeUrl(value);
  return parsed?.normalizedUrl ?? null;
}
