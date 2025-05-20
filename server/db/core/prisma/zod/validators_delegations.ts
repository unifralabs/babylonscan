import * as z from "zod"

export const validators_delegationsModel = z.object({
  id: z.bigint(),
  delegator: z.string(),
  validator: z.string(),
  denom: z.string(),
  amount: z.number(),
  shares: z.number().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
