import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const contract_code_verify_jobModel = z.object({
  uid: z.string(),
  code_id: z.bigint(),
  verification_settings: jsonSchema,
  status: z.number().int().nullish(),
  failed_reason: z.string().nullish(),
})
