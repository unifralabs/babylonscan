export const BASE_ROUTES = {
  home: '/',
  account: {
    watchList: '/account/watch-list',
    nameTags: '/account/name-tags',
    apiKey: '/account/api-key',
    billing: '/account/billing',
  },
  blockchain: {
    blocks: {
      index: '/blocks',
      detail: '/block/:height',
    },
    transactions: {
      index: '/transactions',
      detail: '/tx/:hash',
    },
    topAccounts: '/top-accounts',
    validators: {
      index: '/validators',
      detail: '/validator/:address',
    },
    finalityProvider: {
      index: '/finality-providers',
      detail: '/finality-provider/:address',
    },
    contracts: {
      index: '/contracts',
      detail: '/contract/:address',
    },
    proposals: {
      index: '/proposals',
    },
    addressDetail: '/address/:address',
  },
  token: {
    index: '/tokens',
    detail: '/token/:denom',
  },
  code: {
    detail: '/code/:code_id',
  },
  contract: {
    detail: '/contract/:address',
  },
}

export const BABYLON_ROUTES = {
  chain: {
    index: '/consumer-chains',
  },
  staking: {
    bbn: {
      index: '/staking/bbn',
    },
    leaderboard: {
      index: '/leaderboard',
    },
    finalityProvider: {
      index: '/finality-providers',
      detail: '/finality-provider/:address',
    },
    btcFinalityProvider: {
      index: '/btc-finality-providers',
      detail: '/btc-finality-provider/:address',
    },
    transactions: {
      index: '/staking-transactions',
      detail: '/tx/:address',
    },
  },
}

export const FULL_ROUTES = {
  ...BASE_ROUTES,
  ...BABYLON_ROUTES,
}
