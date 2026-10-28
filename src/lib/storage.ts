export const STORAGE_KEYS = {
  code: "gt-code",
  filter: "gt-filter",
  sort: "gt-sort",
  view: "gt-view",
  accent: "gt-accent",
  colorMode: "gt-mode",
} as const;

export function loadValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storeValue(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, blocked site data) — remembering is optional.
  }
}
