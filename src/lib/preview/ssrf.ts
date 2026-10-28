import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";

const ALLOWED_PORTS = new Set(["", "80", "443"]);
const BLOCKED_HOSTNAMES = /(^|\.)(localhost|local|internal|localdomain)$/i;

export function isPublicIp(ip: string): boolean {
  if (!ipaddr.isValid(ip)) return false;
  return ipaddr.process(ip).range() === "unicast";
}

/** Syntactic checks only: scheme, port, hostname shape. */
export function parseSafeUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!ALLOWED_PORTS.has(url.port)) return null;
  if (url.username || url.password) return null;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host || BLOCKED_HOSTNAMES.test(host)) return null;
  if (ipaddr.isValid(host) && !isPublicIp(host)) return null;
  return url;
}

/**
 * Full check: syntactic rules plus DNS resolution to public addresses only.
 * Note: fetch resolves DNS again, so a DNS-rebinding race remains possible.
 */
export async function resolveSafeUrl(raw: string): Promise<URL | null> {
  const url = parseSafeUrl(raw);
  if (!url) return null;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (ipaddr.isValid(host)) return url;
  try {
    const addrs = await lookup(host, { all: true, verbatim: true });
    if (addrs.length === 0) return null;
    return addrs.every((a) => isPublicIp(a.address)) ? url : null;
  } catch {
    return null;
  }
}
