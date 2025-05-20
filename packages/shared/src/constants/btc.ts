import { Network } from '../types'
import { networks } from 'bitcoinjs-lib'

export const BTC_NETWORK: Network =
  (process.env.COSMOSCAN_PUBLIC_BTC_NETWORK as any) || Network.MAINNET

export const BITCOIN_NETWORK =
  Network.MAINNET === BTC_NETWORK ? networks.bitcoin : networks.testnet

export const BTC_CURRENCY =
  Network.MAINNET === BTC_NETWORK
    ? 'BTC'
    : Network.SIGNET === BTC_NETWORK
      ? 'sBTC'
      : 'tBTC'

export const MEMPOOL_URL = `https://mempool.space${BTC_NETWORK === Network.MAINNET ? '' : `/${BTC_NETWORK}`}`

export const MEMPOOL_API_URL = `${MEMPOOL_URL}/api`

export const BTC_DUST_SAT = 546

export const BABYLON_STAKING_TERMS_LINK =
  'https://cottony-kicker-6f8.notion.site/Babylon-Staking-Terms-of-Use-d26d1cea909e4715b8a48cf935f29e9d?pvs=4'
