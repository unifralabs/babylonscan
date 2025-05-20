import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const proposalsModel = z.object({
  id: z.number().int(),
  proposal_id: z.bigint(),
  submit_tx_hash: z.string().nullish(),
  submit_height: z.bigint().nullish(),
  message_types: z.string().array(),
  messages: jsonSchema,
  status: z.string().nullish(),
  final_tally_result: jsonSchema,
  tally_result: jsonSchema,
  submit_time: z.bigint().nullish(),
  deposite_end_time: z.bigint().nullish(),
  total_deposit: jsonSchema,
  voting_start_time: z.bigint().nullish(),
  voting_end_time: z.bigint().nullish(),
  metadata: z.string().nullish(),
  title: z.string().nullish(),
  summary: z.string().nullish(),
  proposer: z.string().nullish(),
  expedited: z.boolean().nullish(),
  failed_reason: z.string().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
