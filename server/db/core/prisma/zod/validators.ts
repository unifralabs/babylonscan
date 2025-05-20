import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const validatorsModel = z.object({
  id: z.number().int(),
  operator_address: z.string(),
  owner_address: z.string(),
  consensus_pubkey_type: z.string(),
  consensus_pubkey: z.string(),
  hex_address: z.string(),
  signer_address: z.string(),
  name: z.string().nullish(),
  website: z.string().nullish(),
  memo: z.string().nullish(),
  commission: z.number().nullish(),
  max_rate: z.number().nullish(),
  max_change_rate: z.number().nullish(),
  voting_power: z.number().nullish(),
  self_bonded: z.number().nullish(),
  status: z.string().nullish(),
  jailed: z.boolean().nullish(),
  raw_json: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
})
