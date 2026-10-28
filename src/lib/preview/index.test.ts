import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async (host: string) =>
    host === "evil.example" ? [{ address: "10.0.0.1", family: 4 }] : [{ address: "93.184.216.34", family: 4 }],
  ),
}));

const { getPreview } = await import("./index");

function htmlResponse(html: string, init: ResponseInit = {}) {
  return new Response(html, { status: 200, headers: { "content-type": "text/html" }, ...init });
}

afterEach(() => vi.unstubAllGlobals());

describe("getPreview", () => {
  test("uses fxtwitter for X links", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) =>
      Response.json({ tweet: { text: "hi", author: { name: "N", screen_name: "fan" }, media: { photos: [{ url: "https://p/a.jpg" }] } } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const pv = await getPreview("https://x.com/fan/status/42");
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.fxtwitter.com/fan/status/42");
    expect(pv).toEqual({ ok: true, image: "https://p/a.jpg", author: "@fan", name: "N", text: "hi" });
  });

  test("reads og tags for other sites", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      htmlResponse(`<meta property="og:title" content="T"><meta property="og:image" content="https://i/x.png">`),
    ));
    expect(await getPreview("https://shop.example/p")).toEqual({ ok: true, image: "https://i/x.png", author: "", name: "T", text: "" });
  });

  test("re-checks redirects against SSRF rules", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://evil.example/" } }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await getPreview("https://shop.example/p")).ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("never throws when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("boom"); }));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect((await getPreview("https://shop.example/p")).ok).toBe(false);
  });

  test("returns not-ok for non-html responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({})));
    expect((await getPreview("https://shop.example/p")).ok).toBe(false);
  });
});
