import { fail, ok, serverError } from "@/lib/http";
import { MAX_ITEMS_PER_LIST } from "@/lib/limits";
import { MSG } from "@/lib/messages";
import { countItems, restoreItem } from "@/lib/repo";
import { codeSchema, itemIdSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ code: string; id: string }> };

/** Undo a delete ("เลิกทำ"). */
export async function POST(_req: Request, ctx: Ctx) {
  const params = await ctx.params;
  const code = codeSchema.safeParse(params.code);
  const id = itemIdSchema.safeParse(params.id);
  if (!code.success || !id.success) return fail(MSG.badInput, 400);

  try {
    const count = await countItems(code.data);
    if (count === null) return fail(MSG.codeNotFound, 404);
    if (count >= MAX_ITEMS_PER_LIST) return fail(MSG.listFull, 409);
    const item = await restoreItem(code.data, id.data);
    return item ? ok(item) : fail(MSG.itemNotFound, 404);
  } catch (err) {
    return serverError("restore item", err, { list_code: code.data, item_id: id.data });
  }
}
