import {
  Chain,
  ChainIdEnum,
  ChainNetworkEnum,
  ChainTypeEnum,
  getChainInfo,
} from '../../types'
import {
  assets as BabylonTestnetAssets,
  chain as BabylonTestnetRegistryChain,
} from 'chain-registry/testnet/babylontestnet'

export const BabylonTestnetChain = {
  ...BabylonTestnetRegistryChain,
  // chain_name: 'babylontestnet',
  chain_id: 'bbn-test-5',
  codebase: {
    cosmos_sdk_version: 'v0.50.9-lsm',
    cosmwasm_version: 'v0.51.0',
  },
  apis: {
    rpc: [
      {
        address: 'https://babylon-testnet-rpc.unifra.io',
        provider: 'Babylon foundation',
      },
    ],
    rest: [
      {
        address: 'https://babylon-testnet-api.nodes.guru',
        provider: 'Babylon foundation',
      },
    ],
    grpc: [],
  },
  fee_tokens: [
    {
      denom: 'ubbn',
      fixed_min_gas_price: 0.007,
      low_gas_price: 0.007,
      average_gas_price: 0.007,
      high_gas_price: 0.01,
    },
  ],
}

export const babylonTestnet: Chain = {
  chainId: ChainIdEnum.BABYLON_TESTNET,
  type: ChainTypeEnum.BABYLON,
  network: ChainNetworkEnum.TESTNET,
  name: 'Babylon Testnet',
  nativeToken: {
    name: 'tBABY',
    symbol: 'tBABY',
    denom: 'ubbn',
    decimals: 6,
  },
  addressPrexfix: 'bbn',
  isBabylon: true,
  porposalTotalBondedValidatorAddress:
    'bbn1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3z9c7xw',
  blockExplorer: 'https://babylon-testnet.l2scan.co',
  cosmosChainInfo: getChainInfo(BabylonTestnetChain, BabylonTestnetAssets),
} as const

export const BABYLON_PHASE2 =
  process.env.COSMOSCAN_PUBLIC_CHAIN_NETWORK_KEY === ChainNetworkEnum.TESTNET
export const BABYLON_PHASE3 =
  process.env.COSMOSCAN_PUBLIC_CHAIN_NETWORK_KEY === ChainNetworkEnum.DEVNET
