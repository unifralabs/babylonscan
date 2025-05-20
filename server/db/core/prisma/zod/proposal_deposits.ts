import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const proposal_depositsModel = z.object({
  id: z.number().int(),
  proposal_id: z.bigint(),
  depositor: z.string(),
  inserted_at: z.date(),
  updated_at: z.date(),
  total_amount: jsonSchema,
  amount: z.number().nullish(),
})
