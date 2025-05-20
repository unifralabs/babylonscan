import {
  ChainIdEnum,
  ChainNetworkEnum,
  ChainTypeEnum,
  getChainInfo,
  type Chain,
} from '../../types'
import {
  assets as BabylonMainnetAssets,
  chain as BabylonMainnetRegistryChain,
} from 'chain-registry/mainnet/babylon'

export const BabylonMainnetChain = {
  ...BabylonMainnetRegistryChain,
  chain_id: 'bbn-1',
  codebase: {
    cosmos_sdk_version: 'v0.50.12',
    cosmwasm_version: 'v0.54.0',
  },
  apis: {
    rpc: [
      {
        address: 'https://babylon-mainnet-rpc.unifra.io',
        provider: 'Unifra',
      },
      {
        address: 'https://babylon.nodes.guru/rpc',
        provider: 'Nodes.Guru',
      },
      {
        address: 'https://babylon-rpc.polkachu.com',
        provider: 'Polkachu',
      },
    ],
    rest: [
      {
        address: 'https://babylon-mainnet-api.nodes.guru',
        provider: 'Babylon foundation',
      },
      {
        address: 'https://babylon.nodes.guru/api',
        provider: 'Nodes.Guru',
      },
      {
        address: 'https://babylon-api.polkachu.com',
        provider: 'Polkachu',
      },
    ],
    grpc: [
      {
        address: 'babylon.nodes.guru:443/grpc',
        provider: 'Nodes.Guru',
      },
      {
        address: 'babylon-grpc.polkachu.com:20690',
        provider: 'Polkachu',
      },
    ],
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

export const babylon: Chain = {
  chainId: ChainIdEnum.BABYLON_MAINNET,
  type: ChainTypeEnum.BABYLON,
  network: ChainNetworkEnum.MAINNET,
  name: 'Babylon',
  nativeToken: {
    name: 'BABY',
    symbol: 'BABY',
    denom: 'ubbn',
    decimals: 6,
  },
  addressPrexfix: 'bbn',
  isBabylon: true,
  porposalTotalBondedValidatorAddress: '',
  blockExplorer: 'https://babylon.l2scan.co',
  cosmosChainInfo: getChainInfo(BabylonMainnetChain, BabylonMainnetAssets),
} as const
