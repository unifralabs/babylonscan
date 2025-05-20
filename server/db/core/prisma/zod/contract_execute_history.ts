import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const contract_execute_historyModel = z.object({
  id: z.bigint(),
  address: z.string(),
  sender: z.string(),
  height: z.bigint().nullish(),
  tx_index: z.number().int().nullish(),
  tx_hash: z.string().nullish(),
  msg_index: z.number().int().nullish(),
  timestamp: z.bigint().nullish(),
  funds: jsonSchema,
  msg: jsonSchema,
  raw_msg: z.string().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
