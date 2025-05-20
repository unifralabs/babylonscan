import * as z from "zod"

export const transaction_addressesModel = z.object({
  id: z.number().int(),
  address: z.string(),
  tx_hash: z.string(),
  height: z.bigint(),
  tx_index: z.number().int(),
  block_hash: z.string(),
  participants: z.string().array(),
  message_types: z.string().array(),
  timestamp: z.bigint(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
