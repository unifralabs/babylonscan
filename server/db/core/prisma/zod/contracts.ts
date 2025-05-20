import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const contractsModel = z.object({
  id: z.bigint(),
  address: z.string(),
  code_id: z.bigint(),
  creator: z.string().nullish(),
  admin: z.string().nullish(),
  label: z.string().nullish(),
  creation_height: z.bigint().nullish(),
  creation_tx_index: z.number().int().nullish(),
  creation_tx_hash: z.string().nullish(),
  creation_timestamp: z.bigint().nullish(),
  ibc_port_id: z.string().nullish(),
  extension: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
})
