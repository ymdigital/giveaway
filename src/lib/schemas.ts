import { z } from "zod";
import { isValidCode, normalizeCode } from "./code";
import { HTTP_URL_PATTERN, LIMITS } from "./limits";
import { ACCENTS } from "./types";

export const codeSchema = z
  .string()
  .transform(normalizeCode)
  .refine(isValidCode, { message: "invalid code" });

export const accentSchema = z.enum(ACCENTS);

const optionalText = (max: number) => z.string().trim().max(max).optional();

const urlField = z.string().trim().max(LIMITS.url).regex(HTTP_URL_PATTERN);

// Only https images are stored; anything else is dropped to empty.
const imageField = z
  .string()
  .trim()
  .max(LIMITS.image)
  .transform((v) => (/^https:\/\/\S+$/i.test(v) ? v : ""))
  .optional();

export const createListSchema = z.object({ code: codeSchema });

export const updateListSchema = z.object({ accent: accentSchema });

export const createItemSchema = z.object({
  url: urlField,
  title: optionalText(LIMITS.title),
  pickup: optionalText(LIMITS.pickup),
  note: optionalText(LIMITS.note),
  image: imageField,
  author: optionalText(LIMITS.author),
});

export const updateItemSchema = createItemSchema
  .partial()
  .extend({ collected: z.boolean().optional() })
  .refine((v) => Object.keys(v).length > 0, { message: "empty update" });

export const itemIdSchema = z.uuid();

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
