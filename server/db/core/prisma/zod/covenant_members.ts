import * as z from "zod"

export const covenant_membersModel = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  website: z.string().nullish(),
  logo: z.string().nullish(),
  pks: z.string().array(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
