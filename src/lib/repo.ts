import "server-only";
import { getSupabase } from "./supabase-server";
import type { CreateItemInput, CreateListInput, UpdateItemInput, UpdateListInput } from "./schemas";
import type { Accent, ColorMode, Item, ListData } from "./types";

const ITEM_COLUMNS =
  "id,url,title,pickup,note,image,author,collected,created_at,updated_at";
const UNIQUE_VIOLATION = "23505";
// Soft-deleted items stay restorable (undo) for this long, then are purged.
const PURGE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

type ItemRow = {
  id: string;
  url: string;
  title: string | null;
  pickup: string | null;
  note: string | null;
  image: string | null;
  author: string | null;
  collected: boolean;
  created_at: string;
  updated_at: string;
};

export class RepoError extends Error {
  constructor(operation: string, cause: { message: string; code?: string }) {
    super(`${operation}: ${cause.message}`);
    this.name = "RepoError";
    this.cause = cause;
  }
}

function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    url: row.url,
    title: row.title ?? "",
    pickup: row.pickup ?? "",
    note: row.note ?? "",
    image: row.image ?? "",
    author: row.author ?? "",
    collected: row.collected,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Empty strings are stored as NULL; undefined keys are left untouched.
function toColumns(input: UpdateItemInput): Record<string, string | boolean | null> {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, v === "" ? null : (v as string | boolean)]),
  );
}

/** Returns false when the code already exists. */
export async function createList(input: CreateListInput): Promise<boolean> {
  const { error } = await getSupabase()
    .from("lists")
    .insert({ code: input.code, accent: input.accent, color_mode: input.colorMode });
  if (!error) return true;
  if (error.code === UNIQUE_VIOLATION) return false;
  throw new RepoError("create list", error);
}

export async function getList(code: string): Promise<ListData | null> {
  const db = getSupabase();
  const { data: list, error } = await db
    .from("lists")
    .select("code,accent,color_mode")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new RepoError("get list", error);
  if (!list) return null;

  const { data: rows, error: itemsError } = await db
    .from("items")
    .select(ITEM_COLUMNS)
    .eq("list_code", code)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (itemsError) throw new RepoError("get items", itemsError);

  return {
    code: list.code,
    accent: list.accent as Accent,
    colorMode: list.color_mode as ColorMode,
    items: (rows as ItemRow[]).map(toItem),
  };
}

/** Returns false when the list does not exist. */
export async function updateList(code: string, patch: UpdateListInput): Promise<boolean> {
  const columns = Object.fromEntries(
    Object.entries({ accent: patch.accent, color_mode: patch.colorMode }).filter(
      ([, v]) => v !== undefined,
    ),
  );
  const { data, error } = await getSupabase()
    .from("lists")
    .update(columns)
    .eq("code", code)
    .select("code");
  if (error) throw new RepoError("update list", error);
  return data.length > 0;
}

/** Returns null when the list does not exist. */
export async function countItems(code: string): Promise<number | null> {
  const db = getSupabase();
  const { data: list, error } = await db
    .from("lists")
    .select("code")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new RepoError("check list", error);
  if (!list) return null;

  const { count, error: countError } = await db
    .from("items")
    .select("id", { count: "exact", head: true })
    .eq("list_code", code)
    .is("deleted_at", null);
  if (countError) throw new RepoError("count items", countError);
  return count ?? 0;
}

export async function insertItem(code: string, input: CreateItemInput): Promise<Item> {
  const { data, error } = await getSupabase()
    .from("items")
    .insert({ ...toColumns(input), list_code: code })
    .select(ITEM_COLUMNS)
    .single();
  if (error) throw new RepoError("insert item", error);
  return toItem(data as ItemRow);
}

/** Returns null when no item with this id exists in this list. */
export async function updateItem(
  code: string,
  id: string,
  input: UpdateItemInput,
): Promise<Item | null> {
  const { data, error } = await getSupabase()
    .from("items")
    .update(toColumns(input))
    .eq("list_code", code)
    .eq("id", id)
    .is("deleted_at", null)
    .select(ITEM_COLUMNS)
    .maybeSingle();
  if (error) throw new RepoError("update item", error);
  return data ? toItem(data as ItemRow) : null;
}

/** Soft delete. Returns false when no live item with this id exists in this list. */
export async function deleteItem(code: string, id: string): Promise<boolean> {
  const db = getSupabase();
  const { data, error } = await db
    .from("items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("list_code", code)
    .eq("id", id)
    .is("deleted_at", null)
    .select("id");
  if (error) throw new RepoError("delete item", error);

  const purgeBefore = new Date(Date.now() - PURGE_AFTER_MS).toISOString();
  const { error: purgeError } = await db
    .from("items")
    .delete()
    .eq("list_code", code)
    .lt("deleted_at", purgeBefore);
  if (purgeError) {
    // Housekeeping only — the delete itself succeeded, so don't fail the request.
    console.warn(
      JSON.stringify({ level: "warn", msg: "purge deleted items", list_code: code, error: purgeError.message }),
    );
  }

  return data.length > 0;
}

/** Undo a soft delete. Returns null when there is nothing to restore. */
export async function restoreItem(code: string, id: string): Promise<Item | null> {
  const { data, error } = await getSupabase()
    .from("items")
    .update({ deleted_at: null })
    .eq("list_code", code)
    .eq("id", id)
    .not("deleted_at", "is", null)
    .select(ITEM_COLUMNS)
    .maybeSingle();
  if (error) throw new RepoError("restore item", error);
  return data ? toItem(data as ItemRow) : null;
}
