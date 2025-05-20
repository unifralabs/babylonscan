import * as z from "zod"

export const coin_market_dataModel = z.object({
  id: z.bigint(),
  coin_name: z.string(),
  coingecko_id: z.string().nullish(),
  coinmarketcap_id: z.bigint().nullish(),
  price: z.number().nullish(),
  price_change_percentage_24h: z.number().nullish(),
  circulating_market_cap: z.number().nullish(),
  volume_24h: z.number().nullish(),
  total_supply: z.number().nullish(),
  circulating_supply: z.number().nullish(),
  inserted_at: z.date(),
  updated_at: z.date(),
  coin_symbol: z.string().nullish(),
})
