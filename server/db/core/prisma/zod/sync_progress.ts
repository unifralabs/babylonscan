import * as z from "zod"

export const sync_progressModel = z.object({
  id: z.number().int(),
  key: z.string().nullish(),
  value: z.bigint().nullish(),
})
