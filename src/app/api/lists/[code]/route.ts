import { clientIp, fail, ok, readJson, serverError } from "@/lib/http";
import { MSG } from "@/lib/messages";
import { openListLimiter } from "@/lib/limiters";
import { getList, updateList } from "@/lib/repo";
import { codeSchema, updateListSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ code: string }> };

export async function GET(req: Request, ctx: Ctx) {
  if (!openListLimiter.check(clientIp(req))) return fail(MSG.rateLimited, 429);

  const code = codeSchema.safeParse((await ctx.params).code);
  if (!code.success) return fail(MSG.codeRule, 400);

  try {
    const list = await getList(code.data);
    return list ? ok(list) : fail(MSG.codeNotFound, 404);
  } catch (err) {
    return serverError("open list", err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const code = codeSchema.safeParse((await ctx.params).code);
  if (!code.success) return fail(MSG.codeRule, 400);
  const body = updateListSchema.safeParse(await readJson(req));
  if (!body.success) return fail(MSG.badInput, 400);

  try {
    const found = await updateList(code.data, body.data);
    return found ? ok(body.data) : fail(MSG.codeNotFound, 404);
  } catch (err) {
    return serverError("update list", err, { list_code: code.data });
  }
}
