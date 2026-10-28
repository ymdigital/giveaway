import { fail, ok, readJson, serverError } from "@/lib/http";
import { MAX_ITEMS_PER_LIST } from "@/lib/limits";
import { MSG } from "@/lib/messages";
import { countItems, insertItem } from "@/lib/repo";
import { codeSchema, createItemSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ code: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const code = codeSchema.safeParse((await ctx.params).code);
  if (!code.success) return fail(MSG.codeRule, 400);
  const body = createItemSchema.safeParse(await readJson(req));
  if (!body.success) return fail(MSG.badInput, 400);

  try {
    const count = await countItems(code.data);
    if (count === null) return fail(MSG.codeNotFound, 404);
    if (count >= MAX_ITEMS_PER_LIST) return fail(MSG.listFull, 409);
    return ok(await insertItem(code.data, body.data), 201);
  } catch (err) {
    return serverError("add item", err, { list_code: code.data });
  }
}
