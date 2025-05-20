import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const staking_transactionsModel = z.object({
  id: z.number().int(),
  hash: z.string(),
  staking_hash: z.string().nullish(),
  height: z.bigint(),
  staker: z.string().nullish(),
  amount: z.number().nullish(),
  period: z.bigint().nullish(),
  finality_providers: z.string().nullish(),
  timestamp: z.bigint(),
  is_overflow: z.boolean().nullish(),
  staking_output_idx: z.bigint().nullish(),
  tx_status: z.string().nullish(),
  tx_type: z.string().nullish(),
  staking_status: z.string().nullish(),
  inputs: jsonSchema,
  outputs: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
})
