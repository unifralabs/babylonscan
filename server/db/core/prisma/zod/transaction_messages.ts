import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const transaction_messagesModel = z.object({
  id: z.number().int(),
  tx_hash: z.string(),
  message_index: z.number().int(),
  height: z.bigint(),
  transaction_index: z.number().int(),
  block_hash: z.string(),
  message_type: z.string(),
  topic0: z.string().nullish(),
  topic1: z.string().nullish(),
  topic2: z.string().nullish(),
  topic3: z.string().nullish(),
  timestamp: z.bigint(),
  raw_json: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
})
