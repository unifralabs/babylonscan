import * as z from "zod"

export const account_watch_listModel = z.object({
  id: z.number().int(),
  user_id: z.string(),
  address: z.string(),
  email: z.string().nullish(),
  description: z.string().nullish(),
  notification_method: z.string(),
  inserted_at: z.date(),
  updated_at: z.date(),
})
