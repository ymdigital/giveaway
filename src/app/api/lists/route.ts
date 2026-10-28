import { clientIp, fail, ok, readJson, serverError } from "@/lib/http";
import { MSG } from "@/lib/messages";
import { createListLimiter } from "@/lib/limiters";
import { createList, getList } from "@/lib/repo";
import { createListSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  if (!createListLimiter.check(clientIp(req))) return fail(MSG.rateLimited, 429);

  const parsed = createListSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(MSG.codeRule, 400);
  const { code } = parsed.data;

  try {
    const created = await createList(parsed.data);
    if (!created) return fail(MSG.codeTaken, 409);
    const list = await getList(code);
    return ok(list, 201);
  } catch (err) {
    return serverError("create list", err);
  }
}
