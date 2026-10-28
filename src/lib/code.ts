export const CODE_PATTERN = /^[a-z0-9-]{8,40}$/;
export const CODE_MAX_LENGTH = 40;

export function normalizeCode(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

export function isValidCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}
