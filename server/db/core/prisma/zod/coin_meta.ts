import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const coin_metaModel = z.object({
  id: z.bigint(),
  chain_name: z.string(),
  coin_name: z.string(),
  coin_symbol: z.string(),
  description: z.string().nullish(),
  denom_units: jsonSchema,
  base_denom: z.string().nullish(),
  display_denom: z.string().nullish(),
  uri: z.string().nullish(),
  uri_hash: z.string().nullish(),
  coingecko_id: z.string().nullish(),
  coinmarketcap_id: z.bigint().nullish(),
  categories: jsonSchema,
  links: jsonSchema,
  image: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
  type: z.string().nullish(),
})
