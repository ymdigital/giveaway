import "server-only";
import { getSupabase } from "./supabase-server";
import type { CreateItemInput, UpdateItemInput } from "./schemas";
import type { Accent, Item, ListData } from "./types";

const ITEM_COLUMNS =
  "id,url,title,pickup,note,image,author,collected,created_at,updated_at";
const UNIQUE_VIOLATION = "23505";

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
export async function createList(code: string): Promise<boolean> {
  const { error } = await getSupabase().from("lists").insert({ code });
  if (!error) return true;
  if (error.code === UNIQUE_VIOLATION) return false;
  throw new RepoError("create list", error);
}

export async function getList(code: string): Promise<ListData | null> {
  const db = getSupabase();
  const { data: list, error } = await db
    .from("lists")
    .select("code,accent")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new RepoError("get list", error);
  if (!list) return null;

  const { data: rows, error: itemsError } = await db
    .from("items")
    .select(ITEM_COLUMNS)
    .eq("list_code", code)
    .order("created_at", { ascending: false });
  if (itemsError) throw new RepoError("get items", itemsError);

  return {
    code: list.code,
    accent: list.accent as Accent,
    items: (rows as ItemRow[]).map(toItem),
  };
}

/** Returns false when the list does not exist. */
export async function setAccent(code: string, accent: Accent): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("lists")
    .update({ accent })
    .eq("code", code)
    .select("code");
  if (error) throw new RepoError("set accent", error);
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
    .eq("list_code", code);
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
    .select(ITEM_COLUMNS)
    .maybeSingle();
  if (error) throw new RepoError("update item", error);
  return data ? toItem(data as ItemRow) : null;
}

/** Returns false when no item with this id exists in this list. */
export async function deleteItem(code: string, id: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("items")
    .delete()
    .eq("list_code", code)
    .eq("id", id)
    .select("id");
  if (error) throw new RepoError("delete item", error);
  return data.length > 0;
}
