import { z } from "zod";
import { isValidCode, normalizeCode } from "./code";
import { HTTP_URL_PATTERN, LIMITS } from "./limits";
import { normalizePickupDates } from "./pickup";
import { ACCENTS, COLOR_MODES } from "./types";

export const codeSchema = z
  .string()
  .transform(normalizeCode)
  .refine(isValidCode, { message: "invalid code" });

export const accentSchema = z.enum(ACCENTS);
export const colorModeSchema = z.enum(COLOR_MODES);

const optionalText = (max: number) => z.string().trim().max(max).optional();

const urlField = z.string().trim().max(LIMITS.url).regex(HTTP_URL_PATTERN);

// Only https images are stored; anything else is dropped to empty.
const imageField = z
  .string()
  .trim()
  .max(LIMITS.image)
  .transform((v) => (/^https:\/\/\S+$/i.test(v) ? v : ""))
  .optional();

export const pickupDatesSchema = z
  .array(z.object({ date: z.iso.date(), collected: z.boolean() }))
  .max(LIMITS.pickupDates)
  .transform(normalizePickupDates);

export const createListSchema = z.object({
  code: codeSchema,
  accent: accentSchema.optional(),
  colorMode: colorModeSchema.optional(),
});

export const updateListSchema = z
  .object({ accent: accentSchema.optional(), colorMode: colorModeSchema.optional() })
  .refine((v) => v.accent !== undefined || v.colorMode !== undefined, {
    message: "empty update",
  });

export const createItemSchema = z.object({
  url: urlField,
  title: optionalText(LIMITS.title),
  pickup: optionalText(LIMITS.pickup),
  pickupDates: pickupDatesSchema.optional(),
  note: optionalText(LIMITS.note),
  image: imageField,
  author: optionalText(LIMITS.author),
});

export const updateItemSchema = createItemSchema
  .partial()
  .extend({ collected: z.boolean().optional() })
  .refine((v) => Object.keys(v).length > 0, { message: "empty update" });

export const itemIdSchema = z.uuid();

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
