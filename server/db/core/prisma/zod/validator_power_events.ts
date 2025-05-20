import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const validator_power_eventsModel = z.object({
  id: z.number().int(),
  validator: z.string(),
  tx_hash: z.string(),
  height: z.bigint(),
  tx_index: z.number().int(),
  block_hash: z.string(),
  event_type: z.string(),
  amount: z.number().nullish(),
  amount_type: z.string().nullish(),
  total_amount: jsonSchema,
  timestamp: z.bigint(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
