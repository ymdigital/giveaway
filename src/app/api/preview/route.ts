import { NextResponse } from "next/server";
import { EMPTY_PREVIEW, getPreview, PREVIEW_REVALIDATE_SECONDS } from "@/lib/preview";
import { parseSafeUrl } from "@/lib/preview/ssrf";
import { HTTP_URL_PATTERN, LIMITS } from "@/lib/limits";
import { clientIp } from "@/lib/http";
import { previewLimiter } from "@/lib/limiters";

export async function GET(req: Request) {
  const raw = (new URL(req.url).searchParams.get("url") ?? "").trim();
  const isAllowed =
    raw.length <= LIMITS.url && HTTP_URL_PATTERN.test(raw) && parseSafeUrl(raw) !== null;
  if (!isAllowed || !previewLimiter.check(clientIp(req))) {
    return NextResponse.json(EMPTY_PREVIEW);
  }

  const preview = await getPreview(raw);
  const cacheControl = preview.ok
    ? `public, s-maxage=${PREVIEW_REVALIDATE_SECONDS}, stale-while-revalidate=86400`
    : "no-store";
  return NextResponse.json(preview, { headers: { "Cache-Control": cacheControl } });
}
