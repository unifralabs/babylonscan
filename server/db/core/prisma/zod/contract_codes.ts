import * as z from "zod"

export const contract_codesModel = z.object({
  id: z.bigint(),
  code_id: z.bigint(),
  creator: z.string().nullish(),
  data_hash: z.string().nullish(),
  data: z.string().nullish(),
  permission: z.number().int().nullish(),
  permission_address: z.string().array(),
  creation_height: z.bigint().nullish(),
  creation_tx_index: z.number().int().nullish(),
  creation_tx_hash: z.string().nullish(),
  creation_timestamp: z.bigint().nullish(),
  is_verified: z.boolean().nullish(),
  optimizer_type: z.string().nullish(),
  optimizer_version: z.string().nullish(),
  repository_url: z.string().nullish(),
  branch_name: z.string().nullish(),
  source_code: z.string().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
