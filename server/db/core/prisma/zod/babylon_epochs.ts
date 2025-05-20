import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const babylon_epochsModel = z.object({
  id: z.bigint(),
  epoch: z.bigint(),
  current_epoch_interval: z.bigint(),
  first_block_height: z.bigint(),
  last_block_time: z.bigint().nullish(),
  app_hash_root: z.string(),
  sealer_app_hash: z.string(),
  sealer_block_hash: z.string(),
  total_voting_power: z.bigint().nullish(),
  validators: jsonSchema,
  best_submission_btc_block_height: z.bigint().nullish(),
  best_submission_btc_block_hash: z.string().nullish(),
  best_submission_transactions: jsonSchema,
  best_submission_vigilante_address_list: jsonSchema,
  status: z.number().int().nullish(),
  status_desc: z.string().nullish(),
  bitmap: z.string().nullish(),
  bls_multi_sig: z.string().nullish(),
  bls_aggr_pk: z.string().nullish(),
  checkpoint_power_sum: z.bigint().nullish(),
  checkpoint_lift_cycle: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
})
