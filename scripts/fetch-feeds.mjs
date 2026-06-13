import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "src", "generated", "feeds.json");

const feedSources = {
  youtube: [
    { id: "norupaiyaa", channelId: "UCobaq6e-B5QlGcwR8wU4DBA", type: "video", limit: 1 },
    { id: "nomaaya", channelId: "UCJyzUk_Yr57x9jdoD2VbjRQ", type: "shorts", limit: 4 }
  ],
  substack: {
    feedUrl: ""
  }
};

function textBetween(source, start, end) {
  const startIndex = source.indexOf(start);

  if (startIndex < 0) {
    return "";
  }

  const valueStart = startIndex + start.length;
  const endIndex = source.indexOf(end, valueStart);

  if (endIndex < 0) {
    return "";
  }

  return source.slice(valueStart, endIndex).trim();
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function cleanText(value) {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "jaygupta-site-feed-fetcher/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchYouTubeEntries(source) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${source.channelId}`;
  const xml = await fetchText(url);
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .slice(0, source.limit ?? 1)
    .map(([, entry]) => {
      const videoId = textBetween(entry, "<yt:videoId>", "</yt:videoId>");
      const title = cleanText(decodeXml(textBetween(entry, "<title>", "</title>")));
      const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/);
      const publishedAt = textBetween(entry, "<published>", "</published>");

      return {
        videoId,
        title,
        url: linkMatch?.[1] ?? `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt
      };
    })
    .filter((entry) => entry.videoId && entry.title);

  if (!entries.length) {
    throw new Error(`No videos found for ${source.id}`);
  }

  return entries;
}

async function fetchSubstackPosts(feedUrl) {
  if (!feedUrl) {
    return [];
  }

  const xml = await fetchText(feedUrl);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 3);

  return items.map(([, item]) => ({
    title: cleanText(decodeXml(textBetween(item, "<title>", "</title>"))),
    url: decodeXml(textBetween(item, "<link>", "</link>")),
    publishedAt: decodeXml(textBetween(item, "<pubDate>", "</pubDate>"))
  }));
}

const videos = {};
const shorts = {};

for (const source of feedSources.youtube) {
  try {
    const entries = await fetchYouTubeEntries(source);

    if (source.type === "shorts") {
      shorts[source.id] = entries.filter((entry) => entry.url.includes("/shorts/"));
    } else {
      videos[source.id] = entries[0];
    }
  } catch (error) {
    console.warn(`Feed fallback for ${source.id}: ${error.message}`);
  }
}

let posts = [];

try {
  posts = await fetchSubstackPosts(feedSources.substack.feedUrl);
} catch (error) {
  console.warn(`Substack feed fallback: ${error.message}`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      videos,
      shorts,
      posts
    },
    null,
    2
  )}\n`
);
