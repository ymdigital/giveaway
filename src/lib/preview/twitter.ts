import type { Preview } from "../types";

const TWITTER_HOSTS = /^(www\.|mobile\.)?(x|twitter|fxtwitter|vxtwitter|fixupx|fixvx)\.com$/i;
const TEXT_MAX = 280;

export type TweetRef = { user: string; id: string };

export function parseTweetUrl(raw: string): TweetRef | null {
  try {
    const url = new URL(raw);
    if (!TWITTER_HOSTS.test(url.hostname)) return null;
    const match = url.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/status(?:es)?\/(\d{1,25})/);
    return match ? { user: match[1], id: match[2] } : null;
  } catch {
    return null;
  }
}

type MediaEntry = { url?: unknown; thumbnail_url?: unknown };
type FxTweetResponse = {
  tweet?: {
    text?: unknown;
    author?: { name?: unknown; screen_name?: unknown };
    media?: { photos?: MediaEntry[]; videos?: MediaEntry[]; all?: MediaEntry[] };
  };
};

const str = (v: unknown) => (typeof v === "string" ? v : "");
const httpsOnly = (v: string) => (/^https:\/\//i.test(v) ? v : "");

export function mapFxTweet(json: unknown): Preview | null {
  const tweet = (json as FxTweetResponse | null)?.tweet;
  if (!tweet) return null;
  const media = tweet.media ?? {};
  const image =
    str(media.photos?.[0]?.url) ||
    str(media.videos?.[0]?.thumbnail_url) ||
    str(media.all?.find((m) => str(m.thumbnail_url) || str(m.url))?.thumbnail_url) ||
    str(media.all?.[0]?.url);
  const screenName = str(tweet.author?.screen_name);
  return {
    ok: true,
    image: httpsOnly(image),
    author: screenName ? `@${screenName}` : "",
    name: str(tweet.author?.name),
    text: str(tweet.text).slice(0, TEXT_MAX),
  };
}
