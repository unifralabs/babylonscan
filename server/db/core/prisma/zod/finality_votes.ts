import * as z from "zod"

export const finality_votesModel = z.object({
  id: z.number().int(),
  height: z.bigint(),
  index: z.number().int(),
  btc_pk: z.string(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
