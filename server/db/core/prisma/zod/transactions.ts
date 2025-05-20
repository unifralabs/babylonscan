import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const transactionsModel = z.object({
  id: z.number().int(),
  hash: z.string(),
  height: z.bigint(),
  tx_index: z.number().int(),
  status: z.number().int().nullish(),
  type: z.string().nullish(),
  message_types: z.string().array(),
  from_address: z.string().nullish(),
  to_address: z.string().nullish(),
  amount: z.number().nullish(),
  total_amount: jsonSchema,
  amount_type: z.string().nullish(),
  tx_fee: jsonSchema,
  messages: jsonSchema,
  memo: z.string().nullish(),
  signatures: z.string().array(),
  gas_wanted: z.number().nullish(),
  gas_used: z.number().nullish(),
  error_message: z.string().nullish(),
  timestamp: z.bigint(),
  event_logs: jsonSchema,
  raw_json: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
})
