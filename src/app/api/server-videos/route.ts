import { createHash } from "crypto";
import { NextResponse } from "next/server";

import {
  STREAMING_RECORDS_BASE_URL,
  STREAMING_STREAM_KEY,
  STREAMING_VOD_HLS_BASE_URL,
} from "@/lib/streaming-config";
import type { VodVideo } from "@/types/media";

type VideoManifestItem = Partial<VodVideo> & {
  name?: string;
  url?: string;
  src?: string;
  path?: string;
};

type DiscoveryResult = {
  videos: VodVideo[];
  notes: string[];
};

const PLAYABLE_VIDEO_PATTERN = /\.(m3u8|mp4|webm|ogg)$/i;
const CONFIGURED_VIDEO_URLS = (
  process.env.SERVER_VIDEO_URLS ||
  process.env.NEXT_PUBLIC_SERVER_VIDEO_URLS ||
  ""
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const INDEX_URLS = [
  `${STREAMING_VOD_HLS_BASE_URL}/manifest.json`,
  `${STREAMING_VOD_HLS_BASE_URL}/index.json`,
  `${STREAMING_VOD_HLS_BASE_URL}/videos.json`,
  `${STREAMING_RECORDS_BASE_URL}/manifest.json`,
  `${STREAMING_RECORDS_BASE_URL}/index.json`,
  `${STREAMING_RECORDS_BASE_URL}/videos.json`,
  `${STREAMING_VOD_HLS_BASE_URL}/`,
  `${STREAMING_RECORDS_BASE_URL}/`,
];

export async function GET() {
  const result = await discoverServerVideos();

  return NextResponse.json({
    success: true,
    message: buildMessage(result),
    data: {
      videos: result.videos,
      notes: result.notes,
    },
  });
}

async function discoverServerVideos(): Promise<DiscoveryResult> {
  const notes: string[] = [];
  const videos = new Map<number, VodVideo>();

  for (const url of CONFIGURED_VIDEO_URLS) {
    const video = await getConfiguredVideo(url, notes);

    if (video) {
      videos.set(video.id, video);
    }
  }

  for (const url of INDEX_URLS) {
    try {
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        notes.push(`${url} -> ${response.status}`);
        continue;
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("json") || url.endsWith(".json")) {
        const body = (await response.json()) as unknown;

        for (const video of videosFromManifest(body, url)) {
          videos.set(video.id, video);
        }

        continue;
      }

      const html = await response.text();

      for (const video of await videosFromAutoIndex(url, html, 0, notes)) {
        videos.set(video.id, video);
      }
    } catch (error) {
      notes.push(`${url} -> ${error instanceof Error ? error.message : "fetch failed"}`);
    }
  }

  return {
    videos: [...videos.values()].sort(sortVideos),
    notes,
  };
}

async function getConfiguredVideo(url: string, notes: string[]) {
  if (!isPlayableUrl(url)) {
    notes.push(`${url} -> định dạng chưa hỗ trợ`);
    return null;
  }

  try {
    const response = await fetch(url, { cache: "no-store", method: "HEAD" });

    if (!response.ok) {
      notes.push(`${url} -> ${response.status}`);
      return null;
    }

    return toVodVideo(url);
  } catch (error) {
    notes.push(`${url} -> ${error instanceof Error ? error.message : "fetch failed"}`);
    return null;
  }
}

function videosFromManifest(body: unknown, sourceUrl: string) {
  const rawItems = Array.isArray(body)
    ? body
    : body && typeof body === "object" && "videos" in body
      ? (body as { videos?: unknown }).videos
      : null;

  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item) => normalizeManifestItem(item, sourceUrl))
    .filter((video): video is VodVideo => Boolean(video));
}

function normalizeManifestItem(item: unknown, sourceUrl: string) {
  if (!item || typeof item !== "object") return null;

  const manifestItem = item as VideoManifestItem;
  const rawUrl =
    manifestItem.hlsUrl || manifestItem.url || manifestItem.src || manifestItem.path;

  if (!rawUrl) return null;

  const playUrl = toAbsoluteUrl(String(rawUrl), sourceUrl);

  if (!isPlayableUrl(playUrl)) return null;

  return toVodVideo(playUrl, {
    title: manifestItem.title || manifestItem.name,
    description: manifestItem.description,
    createdAt: manifestItem.createdAt,
    duration: manifestItem.duration,
    thumbnailUrl: manifestItem.thumbnailUrl,
  });
}

async function videosFromAutoIndex(
  indexUrl: string,
  html: string,
  depth: number,
  notes: string[]
) {
  const videos: VodVideo[] = [];
  const hrefs = extractHrefs(html);

  for (const href of hrefs) {
    if (!href || href.startsWith("?") || href.startsWith("#") || href === "../") {
      continue;
    }

    const absoluteUrl = toAbsoluteUrl(href, indexUrl);

    if (isPlayableUrl(absoluteUrl)) {
      videos.push(toVodVideo(absoluteUrl));
      continue;
    }

    if (depth < 2 && absoluteUrl.endsWith("/")) {
      try {
        const response = await fetch(absoluteUrl, { cache: "no-store" });

        if (!response.ok) {
          notes.push(`${absoluteUrl} -> ${response.status}`);
          continue;
        }

        const childHtml = await response.text();
        videos.push(
          ...(await videosFromAutoIndex(absoluteUrl, childHtml, depth + 1, notes))
        );
      } catch (error) {
        notes.push(
          `${absoluteUrl} -> ${error instanceof Error ? error.message : "fetch failed"}`
        );
      }
    }
  }

  return videos;
}

function toVodVideo(
  playUrl: string,
  overrides: Partial<Pick<VodVideo, "title" | "description" | "createdAt" | "duration" | "thumbnailUrl">> = {}
): VodVideo {
  return {
    id: idFromUrl(playUrl),
    title: String(overrides.title || titleFromUrl(playUrl)),
    description: overrides.description ?? "Video được lấy trực tiếp từ VPS streaming.",
    type: "RECORD",
    hlsUrl: playUrl,
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    duration: overrides.duration ?? null,
    createdAt: overrides.createdAt ?? null,
    streamer: {
      id: 1036234179,
      username: STREAMING_STREAM_KEY,
      avatarUrl: null,
    },
  };
}

function extractHrefs(html: string) {
  const hrefs: string[] = [];
  const pattern = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html))) {
    hrefs.push(match[1]);
  }

  return hrefs;
}

function toAbsoluteUrl(value: string, baseUrl: string) {
  return new URL(value, baseUrl).toString();
}

function isPlayableUrl(url: string) {
  return PLAYABLE_VIDEO_PATTERN.test(new URL(url).pathname);
}

function idFromUrl(url: string) {
  const hash = createHash("sha1").update(url).digest("hex");
  return parseInt(hash.slice(0, 10), 16);
}

function titleFromUrl(url: string) {
  const parts = new URL(url).pathname
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
  const fileName = parts.at(-1) || "server-video";
  const baseName = fileName.replace(PLAYABLE_VIDEO_PATTERN, "");
  const parentName = parts.at(-2);
  const titleSource =
    parentName && ["index", "master", "playlist", "stream"].includes(baseName.toLowerCase())
      ? parentName
      : baseName;

  return titleSource
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sortVideos(left: VodVideo, right: VodVideo) {
  const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
  const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
  return rightTime - leftTime;
}

function buildMessage(result: DiscoveryResult) {
  if (result.videos.length > 0) {
    return "Đã lấy video trực tiếp từ VPS streaming";
  }

  return "Chưa tìm thấy file HLS/MP4 được expose từ VPS. Cần bật autoindex hoặc tạo manifest JSON cho thư mục video";
}
