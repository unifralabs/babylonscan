import * as z from "zod"

export const address_metaModel = z.object({
  id: z.bigint(),
  bbn_pk: z.string(),
  bbn_address: z.string(),
  btc_pk: z.string().nullish(),
  btc_address: z.string().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
