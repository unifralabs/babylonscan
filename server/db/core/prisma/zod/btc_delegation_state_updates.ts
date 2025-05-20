import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const btc_delegation_state_updatesModel = z.object({
  id: z.number().int(),
  delegator: z.string(),
  state: z.string(),
  validator: z.string(),
  amount: jsonSchema,
  height: z.bigint(),
  timestamp: z.bigint(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
