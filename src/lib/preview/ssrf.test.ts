import { describe, expect, test } from "vitest";
import { isPublicIp, parseSafeUrl, resolveSafeUrl } from "./ssrf";

describe("isPublicIp", () => {
  test.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "0.0.0.0", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1", "100.64.0.1"])(
    "blocks %s",
    (ip) => expect(isPublicIp(ip)).toBe(false),
  );
  test.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("allows %s", (ip) => {
    expect(isPublicIp(ip)).toBe(true);
  });
});

describe("parseSafeUrl", () => {
  test.each([
    "file:///etc/passwd",
    "ftp://example.com",
    "http://localhost/",
    "http://foo.localhost/",
    "http://127.0.0.1/",
    "http://[::1]/",
    "http://169.254.169.254/latest/meta-data",
    "http://example.com:8080/",
    "http://user:pass@example.com/",
    "not a url",
  ])("rejects %s", (u) => expect(parseSafeUrl(u)).toBeNull());

  test.each(["https://example.com/post", "http://example.com:80/", "https://example.com:443/x"])(
    "accepts %s",
    (u) => expect(parseSafeUrl(u)).not.toBeNull(),
  );
});

test("resolveSafeUrl rejects hostnames that resolve to loopback", async () => {
  expect(await resolveSafeUrl("http://localtest.me/")).toBeNull();
});
