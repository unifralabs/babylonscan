import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const proposal_votesModel = z.object({
  id: z.number().int(),
  height: z.bigint().nullish(),
  tx_index: z.number().int().nullish(),
  block_hash: z.string().nullish(),
  tx_hash: z.string().nullish(),
  proposal_id: z.bigint(),
  voter: z.string(),
  options: jsonSchema,
  metadata: z.string().nullish(),
  timestamp: z.bigint().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
  vote_option: z.number().int().nullish(),
  vote_weight: z.number().nullish(),
})
