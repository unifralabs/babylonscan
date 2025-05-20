import * as z from "zod"

export const coin_balanceModel = z.object({
  id: z.bigint(),
  address: z.string(),
  denom: z.string(),
  balance: z.number().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
