import type {
  AssetList as ChainRegistryAssets,
  Chain as ChainRegistryChain,
} from '@chain-registry/types'

export function getChainInfo(
  chain: ChainRegistryChain,
  assets: ChainRegistryAssets,
) {
  return {
    chainName: chain.chain_name,
    chain,
    assets,
  }
}

export enum ChainIdEnum {
  BABYLON_MAINNET = 'babylon-mainnet',
  BABYLON_TESTNET = 'babylon-testnet',
  BABYLON_DEVNET = 'babylon-devnet',
  COSMOS_HUB_MAINNET = 'cosmoshub-mainnet',
  COSMOS_HUB_TESTNET = 'cosmoshub-testnet',
}

export enum ChainTypeEnum {
  BABYLON = 'Babylon',
  COSMOS_HUB = 'CosmosHub',
}

export enum ChainNetworkEnum {
  DEVNET = 'Devnet',
  TESTNET = 'Testnet',
  MAINNET = 'Mainnet',
}

export type Chain = {
  chainId: ChainIdEnum
  type: ChainTypeEnum
  network: ChainNetworkEnum
  name: string
  nativeToken: {
    name: string
    symbol: string
    denom: string
    decimals: number
  }
  addressPrexfix: string
  isBabylon: boolean
  porposalTotalBondedValidatorAddress: string
  blockExplorer: string
  cosmosChainInfo: ReturnType<typeof getChainInfo>
}
