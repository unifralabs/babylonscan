import {
  Chain,
  ChainIdEnum,
  ChainNetworkEnum,
  ChainTypeEnum,
  getChainInfo,
} from '../../types'
import {
  assets as CosmosHubTestnetAssets,
  chain as CosmosHubTestnetChain,
} from 'chain-registry/testnet/cosmoshubtestnet'

export const cosmosHubTestnet: Chain = {
  chainId: ChainIdEnum.COSMOS_HUB_TESTNET,
  type: ChainTypeEnum.COSMOS_HUB,
  network: ChainNetworkEnum.TESTNET,
  name: 'Cosmos Hub Testnet',
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
  cosmosChainInfo: getChainInfo(
    {
      ...CosmosHubTestnetChain,
      apis: {
        rpc: [
          {
            address: 'https://rpc.sentry-01.theta-testnet.polypore.xyz',
            provider: 'Hypha',
          },
          {
            address: 'https://rpc.sentry-02.theta-testnet.polypore.xyz',
            provider: 'Hypha',
          },
        ],
        rest: [
          {
            address: 'https://rest.sentry-01.theta-testnet.polypore.xyz',
            provider: 'Hypha',
          },
          {
            address: 'https://rest.sentry-02.theta-testnet.polypore.xyz',
            provider: 'Hypha',
          },
        ],
        grpc: [
          {
            address: 'https://grpc.sentry-01.theta-testnet.polypore.xyz',
            provider: 'Hypha',
          },
          {
            address: 'https://grpc.sentry-02.theta-testnet.polypore.xyz',
            provider: 'Hypha',
          },
        ],
      },
      // fees: {
      //   fee_tokens: [
      //     {
      //       denom: 'uatom',
      //       fixed_min_gas_price: 0.001705,
      //       low_gas_price: 0.001705,
      //       average_gas_price: 0.00186,
      //       high_gas_price: 0.002015,
      //     },
      //   ],
      // },
    },
    CosmosHubTestnetAssets,
  ),
} as const
