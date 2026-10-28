import { describe, expect, test } from "vitest";
import { decodeEntities, extractOg } from "./og";

test("decodeEntities handles named and numeric", () => {
  expect(decodeEntities("A &amp; B &#39;x&#39; &#x2665; &quot;q&quot; &bogus;")).toBe(`A & B 'x' ♥ "q" &bogus;`);
});

describe("extractOg", () => {
  test("reads og tags with either attribute order", () => {
    const html = `<head>
      <meta property="og:title" content="Fan &amp; Gift">
      <meta content="desc here" property="og:description" />
      <meta name="twitter:image" content="https://cdn.example.com/a.jpg">
    </head>`;
    expect(extractOg(html, "https://example.com")).toEqual({
      image: "https://cdn.example.com/a.jpg",
      title: "Fan & Gift",
      description: "desc here",
    });
  });
  test("resolves relative image and rejects non-https", () => {
    expect(extractOg(`<meta property="og:image" content="/i.png">`, "https://ex.com/p").image).toBe("https://ex.com/i.png");
    expect(extractOg(`<meta property="og:image" content="/i.png">`, "http://ex.com/p").image).toBe("");
  });
});
