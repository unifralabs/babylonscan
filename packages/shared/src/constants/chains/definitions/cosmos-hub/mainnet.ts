import {
  Chain,
  ChainIdEnum,
  ChainNetworkEnum,
  ChainTypeEnum,
  getChainInfo,
} from '../../types'
import {
  assets as CosmosHubMainnetAssets,
  chain as CosmosHubMainnetChain,
} from 'chain-registry/mainnet/cosmoshub'

export const cosmosHub: Chain = {
  chainId: ChainIdEnum.COSMOS_HUB_MAINNET,
  type: ChainTypeEnum.COSMOS_HUB,
  network: ChainNetworkEnum.MAINNET,
  name: 'Cosmos Hub',
  nativeToken: {
    name: 'ATOM',
    symbol: 'ATOM',
    denom: 'uatom',
    decimals: 6,
  },
  addressPrexfix: 'cosmos',
  isBabylon: false,
  porposalTotalBondedValidatorAddress:
    'cosmos1fl48vsnmsdzcv85q5d2q4z5ajdha8yu34mf0eh',
  blockExplorer: 'https://cosmos.l2scan.co',
  cosmosChainInfo: getChainInfo(CosmosHubMainnetChain, CosmosHubMainnetAssets),
} as const
