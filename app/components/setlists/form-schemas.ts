import { z } from "zod";

export const IntentSchema = z.enum([
  "update-setlist",
  "update-name",
  "delete-setlist",
  "clone-setlist",
  "create-public-link",
  "remove-public-link",
  "remove-song",
]);

export const FormSchema = z.object({
  sets: z.string(),
  intent: z.literal(IntentSchema.Enum["update-setlist"]),
});

export const ActionSetSchema = z.record(z.array(z.string()));

export const SetlistNameSchema = z
  .object({
    setlist_name: z.string().min(1),
    intent: z.literal(IntentSchema.Enum["update-name"]),
  })
  .required();

export const DeleteSetlistSchema = z.object({
  intent: z.literal(IntentSchema.Enum["delete-setlist"]),
});

export const CloneSetlistSchema = z.object({
  intent: z.literal(IntentSchema.Enum["clone-setlist"]),
});

export const CreatePublicLinkSchema = z.object({
  intent: z.literal(IntentSchema.Enum["create-public-link"]),
});

export const RemovePublicLinkSchema = z.object({
  intent: z.literal(IntentSchema.Enum["remove-public-link"]),
});
