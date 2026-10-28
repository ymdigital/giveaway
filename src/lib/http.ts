import "server-only";
import { NextResponse } from "next/server";
import { MSG } from "./messages";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Logs once at the boundary and converts to a generic 500. */
export function serverError(operation: string, err: unknown, fields: Record<string, string> = {}) {
  console.error(
    JSON.stringify({
      level: "error",
      msg: operation,
      ...fields,
      error: err instanceof Error ? err.message : String(err),
    }),
  );
  return fail(MSG.server, 500);
}
