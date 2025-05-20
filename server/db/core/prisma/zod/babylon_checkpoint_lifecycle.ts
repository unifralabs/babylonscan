import * as z from "zod"

export const babylon_checkpoint_lifecycleModel = z.object({
  id: z.bigint(),
  epoch: z.bigint(),
  status: z.number().int(),
  status_desc: z.string().nullish(),
  block_height: z.bigint().nullish(),
  block_time: z.bigint().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
