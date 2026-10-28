import "server-only";
import type { Preview } from "../types";
import { extractOg } from "./og";
import { resolveSafeUrl } from "./ssrf";
import { mapFxTweet, parseTweetUrl } from "./twitter";

export const PREVIEW_REVALIDATE_SECONDS = 60 * 60 * 6;
const FETCH_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 512 * 1024;
const TEXT_MAX = 280;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

export const EMPTY_PREVIEW: Preview = { ok: false, image: "", author: "", name: "", text: "" };

let hasLoggedFxSample = false;

async function fetchTweet(user: string, id: string): Promise<Preview> {
  const res = await fetch(`https://api.fxtwitter.com/${user}/status/${id}`, {
    headers: { "User-Agent": "giveaway-tracker" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: PREVIEW_REVALIDATE_SECONDS },
  });
  if (!res.ok) return EMPTY_PREVIEW;
  const json: unknown = await res.json();
  if (process.env.NODE_ENV === "development" && !hasLoggedFxSample) {
    hasLoggedFxSample = true;
    console.debug("[preview] fxtwitter sample response", JSON.stringify(json).slice(0, 4000));
  }
  return mapFxTweet(json) ?? EMPTY_PREVIEW;
}

async function readLimited(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  return new TextDecoder().decode(Buffer.concat(chunks));
}

// Follows redirects manually so every hop passes the SSRF check.
async function fetchHtml(start: string): Promise<{ html: string; finalUrl: string } | null> {
  let current = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const safe = await resolveSafeUrl(current);
    if (!safe) return null;
    const res = await fetch(safe, {
      redirect: "manual",
      headers: { "User-Agent": BROWSER_UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: PREVIEW_REVALIDATE_SECONDS },
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, safe).toString();
      continue;
    }
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return null;
    return { html: await readLimited(res), finalUrl: safe.toString() };
  }
  return null;
}

async function fetchOg(url: string): Promise<Preview> {
  const page = await fetchHtml(url);
  if (!page) return EMPTY_PREVIEW;
  const og = extractOg(page.html, page.finalUrl);
  if (!og.image && !og.title && !og.description) return EMPTY_PREVIEW;
  return {
    ok: true,
    image: og.image,
    author: "",
    name: og.title,
    text: og.description.slice(0, TEXT_MAX),
  };
}

/** Never throws. */
export async function getPreview(url: string): Promise<Preview> {
  try {
    const tweet = parseTweetUrl(url);
    return tweet ? await fetchTweet(tweet.user, tweet.id) : await fetchOg(url);
  } catch (err) {
    console.warn(
      JSON.stringify({
        level: "warn",
        msg: "preview fetch failed",
        host: safeHost(url),
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return EMPTY_PREVIEW;
  }
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "invalid";
  }
}
