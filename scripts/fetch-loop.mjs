import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "src", "youtube-recommended.json");
const outputPath = path.join(root, "src", "generated", "the-loop.json");

function extractYouTubeId(value) {
  const url = String(value ?? "").trim();
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/live\/([\w-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);

    if (match) {
      return match[1];
    }
  }

  return /^[\w-]{11}$/.test(url) ? url : "";
}

const smartDashPattern = new RegExp(
  `[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`,
  "g"
);

function cleanText(value) {
  return String(value ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(smartDashPattern, "-")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchOEmbed(watchUrl) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    watchUrl
  )}&format=json`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "jaygupta-site-loop-fetcher/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

const rawUrls = JSON.parse(await readFile(inputPath, "utf8"));
const videos = [];

for (const rawUrl of rawUrls) {
  const videoId = extractYouTubeId(rawUrl);

  if (!videoId) {
    console.warn(`The Loop skipped invalid YouTube URL: ${rawUrl}`);
    continue;
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = "";
  let channel = "YouTube";

  try {
    const metadata = await fetchOEmbed(watchUrl);
    title = cleanText(metadata.title);
    channel = cleanText(metadata.author_name) || "YouTube";
  } catch (error) {
    console.warn(`The Loop oEmbed fallback for ${watchUrl}: ${error.message}`);
  }

  videos.push({
    id: videoId,
    rawUrl,
    watchUrl,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    title,
    channel
  });
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      videos
    },
    null,
    2
  )}\n`
);
