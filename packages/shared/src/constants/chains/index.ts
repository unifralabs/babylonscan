import * as BabylonChains from './definitions/babylon'
import * as CosmosHubChains from './definitions/cosmos-hub'
import { Chain, ChainNetworkEnum } from './types'

export * from './types'
export * from './definitions/babylon'
export * from './definitions/cosmos-hub'

export const BABYLON_PHASE2 =
  process.env.COSMOSCAN_PUBLIC_CHAIN_NETWORK_KEY === ChainNetworkEnum.TESTNET
export const BABYLON_PHASE3 =
  process.env.COSMOSCAN_PUBLIC_CHAIN_NETWORK_KEY === ChainNetworkEnum.DEVNET

export const BABYLON_CHAINS = [...Object.values(BabylonChains)]

export const COSMOS_CHAINS = [...Object.values(CosmosHubChains)]

export const CURRENT_CHAIN: Chain = [...BABYLON_CHAINS, ...COSMOS_CHAINS].find(
  ({ type, network }) =>
    type === process.env.COSMOSCAN_PUBLIC_CHAIN_TYPE_KEY &&
    network ===
      (process.env.COSMOSCAN_PUBLIC_CHAIN_NETWORK_KEY ||
        ChainNetworkEnum.MAINNET),
)!
