import * as z from "zod"

export const btc_staking_infosModel = z.object({
  id: z.number().int(),
  staking_tx_hex: z.string(),
  staking_term: z.number().int(),
  amount: z.number(),
  period: z.number().int(),
  fp_btc_pk: z.string(),
  address: z.string(),
  public_key_nocoord: z.string(),
  fee_rate: z.number(),
  handling_fee: z.number(),
  memo: z.string().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
  tp_ref: z.string().nullish(),
  transaction_type: z.string().nullish(),
})
