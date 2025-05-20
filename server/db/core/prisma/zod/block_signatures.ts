import * as z from "zod"

export const block_signaturesModel = z.object({
  id: z.number().int(),
  index: z.number().int(),
  validator_address: z.string(),
  signed: z.number().int(),
  timestamp: z.bigint(),
  block_height: z.bigint(),
  block_id_flag: z.number().int(),
})
