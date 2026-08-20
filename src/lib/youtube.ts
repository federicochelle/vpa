const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export interface ParsedYouTubeUrl {
  embedUrl: string;
  normalizedUrl: string;
  videoId: string;
}

function isValidYouTubeVideoId(value: string) {
  return YOUTUBE_VIDEO_ID_PATTERN.test(value);
}

function getVideoIdFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : "";
}

export function parseYouTubeUrl(value: string): ParsedYouTubeUrl | null {
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

  const hostname = url.hostname.toLowerCase();
  let videoId = "";

  if (hostname === "youtu.be") {
    videoId = getVideoIdFromPath(url.pathname);
  } else if (
    hostname === "youtube.com" ||
    hostname === "www.youtube.com" ||
    hostname === "m.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v")?.trim() ?? "";
    } else if (url.pathname.startsWith("/embed/")) {
      videoId = getVideoIdFromPath(url.pathname);
    }
  }

  if (!isValidYouTubeVideoId(videoId)) {
    return null;
  }

  return {
    videoId,
    normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}

export function normalizeYouTubeUrl(value: string) {
  const parsed = parseYouTubeUrl(value);
  return parsed?.normalizedUrl ?? null;
}
