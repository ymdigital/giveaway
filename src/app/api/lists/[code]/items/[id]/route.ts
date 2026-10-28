import { fail, ok, readJson, serverError } from "@/lib/http";
import { MSG } from "@/lib/messages";
import { deleteItem, updateItem } from "@/lib/repo";
import { codeSchema, itemIdSchema, updateItemSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ code: string; id: string }> };

async function parseParams(ctx: Ctx) {
  const params = await ctx.params;
  const code = codeSchema.safeParse(params.code);
  const id = itemIdSchema.safeParse(params.id);
  return code.success && id.success ? { code: code.data, id: id.data } : null;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const params = await parseParams(ctx);
  if (!params) return fail(MSG.badInput, 400);
  const body = updateItemSchema.safeParse(await readJson(req));
  if (!body.success) return fail(MSG.badInput, 400);

  try {
    const item = await updateItem(params.code, params.id, body.data);
    return item ? ok(item) : fail(MSG.itemNotFound, 404);
  } catch (err) {
    return serverError("update item", err, { list_code: params.code, item_id: params.id });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const params = await parseParams(ctx);
  if (!params) return fail(MSG.badInput, 400);

  try {
    const deleted = await deleteItem(params.code, params.id);
    return deleted ? ok({ id: params.id }) : fail(MSG.itemNotFound, 404);
  } catch (err) {
    return serverError("delete item", err, { list_code: params.code, item_id: params.id });
  }
}
