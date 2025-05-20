import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const contract_code_historyModel = z.object({
  id: z.bigint(),
  address: z.string(),
  operation: z.bigint(),
  code_id: z.bigint(),
  height: z.bigint().nullish(),
  tx_index: z.number().int().nullish(),
  tx_hash: z.string().nullish(),
  timestamp: z.bigint().nullish(),
  msg: jsonSchema,
  raw_msg: z.string().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
