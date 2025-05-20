import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const btc_staking_rewardsModel = z.object({
  id: z.bigint(),
  address: z.string(),
  stakeholder_type: z.string(),
  coins: jsonSchema,
  withdrawn_coins: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
})
