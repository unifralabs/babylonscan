let EXCHANGE_RATES: Record<string, string | number> | undefined

setInterval(() => (EXCHANGE_RATES = undefined), 1000 * 60 * 60)

export async function getExchangeRates() {
  try {
    if (!!!EXCHANGE_RATES) {
      const res = await fetch(
        'https://api.coinbase.com/v2/exchange-rates?currency=USD',
      )
      const { data } = await res.json()
      EXCHANGE_RATES = data?.rates
    }
    return EXCHANGE_RATES
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export async function getExchangeRateBySymbol(symbol: string) {
  const exchangeRates = await getExchangeRates()
  return exchangeRates?.[symbol] ?? 0
}
