import { describe, expect, test } from "vitest";
import { mapFxTweet, parseTweetUrl } from "./twitter";

describe("parseTweetUrl", () => {
  test.each([
    "https://x.com/fanbase/status/123",
    "https://twitter.com/fanbase/status/123?s=20",
    "https://mobile.twitter.com/fanbase/status/123",
    "https://fxtwitter.com/fanbase/status/123",
    "https://vxtwitter.com/fanbase/status/123",
    "https://fixupx.com/fanbase/status/123/photo/1",
  ])("parses %s", (u) => {
    expect(parseTweetUrl(u)).toEqual({ user: "fanbase", id: "123" });
  });
  test.each(["https://x.com/fanbase", "https://example.com/fanbase/status/1", "nope"])(
    "ignores %s",
    (u) => expect(parseTweetUrl(u)).toBeNull(),
  );
});

describe("mapFxTweet", () => {
  test("maps photo, author and text", () => {
    const pv = mapFxTweet({
      tweet: {
        text: "แจก!",
        author: { name: "Fan Base", screen_name: "fanbase" },
        media: { photos: [{ url: "https://pbs.twimg.com/a.jpg" }] },
      },
    });
    expect(pv).toEqual({ ok: true, image: "https://pbs.twimg.com/a.jpg", author: "@fanbase", name: "Fan Base", text: "แจก!" });
  });
  test("falls back to video thumbnail and caps text at 280", () => {
    const pv = mapFxTweet({
      tweet: { text: "x".repeat(400), author: {}, media: { videos: [{ thumbnail_url: "https://v/t.jpg" }] } },
    });
    expect(pv?.image).toBe("https://v/t.jpg");
    expect(pv?.author).toBe("");
    expect(pv?.text).toHaveLength(280);
  });
  test("returns null without tweet", () => {
    expect(mapFxTweet({ code: 404 })).toBeNull();
    expect(mapFxTweet(null)).toBeNull();
  });
});
