import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const coin_denomsModel = z.object({
  id: z.bigint(),
  denom: z.string(),
  exponent: z.number().int().nullish(),
  decimals: z.number().int().nullish(),
  coin_name: z.string().nullish(),
  coin_symbol: z.string().nullish(),
  type: z.string(),
  chain_name: z.string(),
  denom_trace: jsonSchema,
  total_supply: z.number().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
