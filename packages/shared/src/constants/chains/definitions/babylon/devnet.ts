import {
  ChainIdEnum,
  ChainNetworkEnum,
  ChainTypeEnum,
  getChainInfo,
  type Chain,
} from '../../types'
import {
  assets as BabylonTestnetAssets,
  chain as BabylonTestnetChain,
} from 'chain-registry/testnet/babylontestnet'

export const BabylonDevnetChain = {
  ...BabylonTestnetChain,
  // chain_name: 'babylondevnet',
  chain_id: 'euphrates-0.5.0',
  codebase: {
    cosmos_sdk_version: 'v0.50.9-lsm',
    cosmwasm_version: 'v0.51.0',
  },
  apis: {
    rpc: [
      {
        address: 'https://rpc-euphrates.devnet.babylonlabs.io/',
        provider: 'Babylon foundation',
      },
    ],
    rest: [
      {
        address: 'https://lcd-euphrates.devnet.babylonlabs.io/',
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

export const babylonDevnet: Chain = {
  chainId: ChainIdEnum.BABYLON_DEVNET,
  type: ChainTypeEnum.BABYLON,
  network: ChainNetworkEnum.DEVNET,
  name: 'Babylon Devnet',
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
  blockExplorer: 'https://babylon-devnet.l2scan.co',
  cosmosChainInfo: getChainInfo(BabylonDevnetChain, BabylonTestnetAssets),
} as const
