import { MSG } from "./messages";
import type { Accent, ApiResult, Item, ListData, Preview } from "./types";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(MSG.network, 0);
  }
  const body = (await res.json().catch(() => null)) as ApiResult<T> | null;
  if (!body) throw new ApiError(MSG.server, res.status);
  if (!body.ok) throw new ApiError(body.error, res.status);
  return body.data;
}

const listPath = (code: string) => `/api/lists/${encodeURIComponent(code)}`;
const itemPath = (code: string, id: string) =>
  `${listPath(code)}/items/${encodeURIComponent(id)}`;

export type ItemDraft = {
  url: string;
  title: string;
  pickup: string;
  note: string;
  image?: string;
  author?: string;
};

export const api = {
  createList: (code: string) =>
    request<ListData>("/api/lists", { method: "POST", body: JSON.stringify({ code }) }),
  openList: (code: string) => request<ListData>(listPath(code)),
  setAccent: (code: string, accent: Accent) =>
    request<{ accent: Accent }>(listPath(code), {
      method: "PATCH",
      body: JSON.stringify({ accent }),
    }),
  addItem: (code: string, draft: ItemDraft) =>
    request<Item>(`${listPath(code)}/items`, { method: "POST", body: JSON.stringify(draft) }),
  updateItem: (code: string, id: string, patch: Partial<ItemDraft> & { collected?: boolean }) =>
    request<Item>(itemPath(code, id), { method: "PATCH", body: JSON.stringify(patch) }),
  deleteItem: (code: string, id: string) =>
    request<{ id: string }>(itemPath(code, id), { method: "DELETE" }),
  async preview(url: string): Promise<Preview | null> {
    try {
      const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
      return res.ok ? ((await res.json()) as Preview) : null;
    } catch {
      return null;
    }
  },
};

export function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "เกิดข้อผิดพลาด ลองอีกครั้งนะคะ";
}
