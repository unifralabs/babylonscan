import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const blocksModel = z.object({
  height: z.bigint(),
  hash: z.string(),
  num_txs: z.number().int().nullish(),
  size: z.number().int().nullish(),
  gas_used: z.bigint().nullish(),
  gas_wanted: z.bigint().nullish(),
  round: z.number().int().nullish(),
  status: z.number().int().nullish(),
  fp_reward: z.number().nullish(),
  validator_reward: z.number().nullish(),
  staker_reward: z.number().nullish(),
  proposer_address: z.string().nullish(),
  timestamp: z.bigint(),
  block_events: jsonSchema,
  raw_json: jsonSchema,
  total_validators: z.number().int().nullish(),
  signed_validators: z.number().int().nullish(),
  validator_set: z.string().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
  btc_staking_reward: jsonSchema,
  btc_timestamping_reward: jsonSchema,
  total_voting_power: z.number().nullish(),
})
