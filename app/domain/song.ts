import { z } from "zod";

export const EditSongSchema = z.object({
  name: z.string().min(1),
  length: z.coerce.number().min(1).default(3),
  keyLetter: z.string().min(1).max(2).default("C"),
  isMinor: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean()),
  tempo: z.coerce.number().min(1).max(420).default(120),
  feels: z.array(z.string()),
  author: z.string().nullish(),
  note: z.string().nullish(),
  links: z.array(
    z
      .string()
      .refine(
        (value) =>
          /^((https?):\/\/)?(?=.*\.[a-z]{2,})[^\s$.?#].[^\s]*$/i.test(value),
        {
          message: "Please enter a valid URL",
        },
      ),
  ),
  position: z.enum(["opener", "closer", "other"]).default("other"),
  rank: z
    .enum(["exclude", "include", "no_preference"])
    .default("no_preference"),
  isCover: z.boolean().default(false),
  showTempo: z.coerce.boolean().default(false),
});

export type TEditSongSchema = z.infer<typeof EditSongSchema>;
