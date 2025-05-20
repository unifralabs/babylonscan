import { FULL_ROUTES } from '@cosmoscan/shared/constants/routes'

export const ROUTES = {
  ...FULL_ROUTES,
  staking: {
    index: '/staking',
    transactions: {
      index: '/staking-transactions',
    },
    finalityProvider: {
      index: '/finality-providers',
    },
    btcFinalityProvider: {
      index: '/btc-finality-providers',
    },
  },
}
