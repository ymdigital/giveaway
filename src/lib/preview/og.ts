const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  hellip: "…", mdash: "—", ndash: "–", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
};

export function decodeEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const isHex = body[1] === "x" || body[1] === "X";
      const cp = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? (m[2] ?? m[3] ?? m[4] ?? "") : "";
}

export function readMetaTags(html: string): Map<string, string> {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return tags.reduce((acc, tag) => {
    const key = (attr(tag, "property") || attr(tag, "name")).toLowerCase();
    if (!key || acc.has(key)) return acc;
    return new Map(acc).set(key, decodeEntities(attr(tag, "content")).trim());
  }, new Map<string, string>());
}

export type OgData = { image: string; title: string; description: string };

export function extractOg(html: string, baseUrl: string): OgData {
  const meta = readMetaTags(html);
  const rawImage =
    meta.get("og:image:secure_url") || meta.get("og:image") || meta.get("twitter:image") || "";
  let image = "";
  try {
    const resolved = rawImage ? new URL(rawImage, baseUrl).toString() : "";
    image = resolved.startsWith("https://") ? resolved : "";
  } catch {
    image = "";
  }
  return {
    image,
    title: meta.get("og:title") || meta.get("twitter:title") || "",
    description: meta.get("og:description") || meta.get("twitter:description") || meta.get("description") || "",
  };
}
