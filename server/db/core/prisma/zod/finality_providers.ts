import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const finality_providersModel = z.object({
  id: z.number().int(),
  btc_pk: z.string(),
  btc_address: z.string().nullish(),
  babylon_pk: z.string(),
  babylon_address: z.string().nullish(),
  master_pub_rand: z.string(),
  name: z.string(),
  description: jsonSchema,
  supported_chains: z.string().array(),
  commission: z.number().nullish(),
  registered_epoch: z.bigint().nullish(),
  slashed_babylon_height: z.bigint().nullish(),
  slashed_btc_height: z.bigint().nullish(),
  voting_power: z.number().nullish(),
  self_bonded: z.number().nullish(),
  uptime: z.number().nullish(),
  status: z.string().nullish(),
  delegations: z.bigint().nullish(),
  total_sat: z.number().nullish(),
  stakers: z.bigint().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
