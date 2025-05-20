import * as z from "zod"

export const fp_metaModel = z.object({
  btc_pk: z.string(),
  name: z.string(),
  moniker: z.string().nullish(),
  identity: z.string().nullish(),
  website: z.string().nullish(),
  security_contact: z.string().nullish(),
  details: z.string().nullish(),
  commission: z.number().nullish(),
  status: z.string().nullish(),
  delegations: z.number().int().nullish(),
  total_sat: z.bigint().nullish(),
})
