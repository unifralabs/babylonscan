import * as z from "zod"

export const zc_chainsModel = z.object({
  id: z.number().int(),
  chain_id: z.string(),
  inserted_at: z.date(),
  updated_at: z.date(),
  chain_description: z.string().nullish(),
  chain_name: z.string().nullish(),
})
