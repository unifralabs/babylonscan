import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const module_paramsModel = z.object({
  id: z.number().int(),
  module_name: z.string(),
  params: jsonSchema,
  inserted_at: z.date(),
  updated_at: z.date(),
})
