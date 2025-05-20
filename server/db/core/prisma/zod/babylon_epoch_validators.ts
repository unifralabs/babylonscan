import * as z from "zod"

export const babylon_epoch_validatorsModel = z.object({
  id: z.bigint(),
  epoch: z.bigint(),
  validator: z.string(),
  voting_power: z.bigint(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
