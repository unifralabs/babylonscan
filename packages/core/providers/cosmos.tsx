'use client'

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { Registry, type TsProtoGeneratedType } from '@cosmjs/proto-signing'
import {
  AminoTypes,
  createDefaultAminoConverters,
  defaultRegistryTypes,
  GasPrice,
} from '@cosmjs/stargate'
import { ChainProvider, useModalTheme } from '@cosmos-kit/react'
import { wallets } from 'cosmos-kit'
import { useTheme } from 'next-themes'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'

import '@interchain-ui/react/styles'

import {
  BABYLON_WRAPPED_MSG,
  MsgBabylonDelegate,
  MsgBabylonDelegateAminoMsg,
  MsgBabylonRedelegate,
  MsgBabylonRedelegateAminoMsg,
  MsgBabylonUndelegate,
  MsgBabylonUndelegateAminoMsg,
  MsgSubmitProposalAminoMsg,
} from '../constants/babylon-cosmos-tx'
import useCosmos from '../hooks/cosmos'
import { cosmos } from 'interchain-query'

import { getAppResolvedTheme } from '@cosmoscan/shared/utils'

export default function CosmosProvider({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme()
  const { setModalTheme } = useModalTheme()

  useEffect(() => {
    setModalTheme(getAppResolvedTheme(resolvedTheme))
  }, [resolvedTheme, setModalTheme])

  return (
    <ChainProvider
      chains={[CURRENT_CHAIN.cosmosChainInfo.chain]}
      assetLists={[CURRENT_CHAIN.cosmosChainInfo.assets]}
      wallets={wallets}
      modalTheme={{
        themeDefs: [
          {
            name: 'l2scan-cosmos',
            vars: {
              colors: {
                primary: 'hsl(var(--primary))',
                body: 'hsl(var(--foreground))',
                background: 'hsl(var(--background))',
                text: 'hsl(var(--foreground))',
                primary500: 'hsl(var(--primary))',
              },
              font: {
                body: 'var(--font-sans)',
              },
            },
          },
        ],
        customTheme: 'l2scan-cosmos',
        modalContainerClassName: '!pointer-events-auto',
      }}
      walletConnectOptions={{
        signClient: {
          projectId: process.env.COSMOSCAN_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
          relayUrl: 'wss://relay.walletconnect.org',
          metadata: {
            name: process.env.COSMOSCAN_PUBLIC_WEBSITE_TITLE!,
            description:
              process.env.COSMOSCAN_PUBLIC_WEBSITE_METADATA_DESCRIPTION!,
            url: CURRENT_CHAIN.blockExplorer,
            icons: [],
          },
        },
      }}
      signerOptions={{
        signingStargate: (chain: any) => {
          const feeToken = chain.fees?.fee_tokens[0]
          const fee = `${feeToken?.average_gas_price || 0.025}${feeToken?.denom}`

          const customTypes: [string, TsProtoGeneratedType][] = [
            [BABYLON_WRAPPED_MSG.delegate, MsgBabylonDelegate as any],
            [BABYLON_WRAPPED_MSG.beginRedelegate, MsgBabylonRedelegate as any],
            [BABYLON_WRAPPED_MSG.undelegate, MsgBabylonUndelegate as any],
          ]

          return {
            gasPrice: GasPrice.fromString(fee),
            registry: new Registry([...defaultRegistryTypes, ...customTypes]),
            aminoTypes: new AminoTypes({
              ...createDefaultAminoConverters(),
              ...MsgBabylonDelegateAminoMsg,
              ...MsgBabylonRedelegateAminoMsg,
              ...MsgBabylonUndelegateAminoMsg,
              ...MsgSubmitProposalAminoMsg,
            }),
          }
        },
      }}
      endpointOptions={{
        endpoints: {
          [CURRENT_CHAIN.cosmosChainInfo.chainName]: {
            rpc: CURRENT_CHAIN.cosmosChainInfo.chain.apis?.rpc?.map(
              ({ address }) => address,
            ),
            rest: CURRENT_CHAIN.cosmosChainInfo.chain.apis?.rest?.map(
              ({ address }) => address,
            ),
          },
        },
      }}
    >
      <CosmosQueryProvider>{children}</CosmosQueryProvider>
    </ChainProvider>
  )
}

export interface CosmosQueryState {
  cosmosQuery?: Awaited<
    ReturnType<typeof cosmos.ClientFactory.createRPCQueryClient>
  >['cosmos']
}

export const CosmosQueryContext = createContext<CosmosQueryState | undefined>(
  undefined,
)

let IS_FETCHING_COSMOS_QUERY = false
let COSMOS_QUERY_CLIENT: Awaited<
  ReturnType<typeof cosmos.ClientFactory.createRPCQueryClient>
>['cosmos']
export function CosmosQueryProvider({ children }: PropsWithChildren) {
  const { getRpcEndpoint } = useCosmos()
  const [cosmosQuery, setCosmosQuery] =
    useState<CosmosQueryState['cosmosQuery']>()

  const fetchCosmosQuery = useCallback(async () => {
    if (!getRpcEndpoint || IS_FETCHING_COSMOS_QUERY) return
    IS_FETCHING_COSMOS_QUERY = true
    if (!!COSMOS_QUERY_CLIENT) {
      setCosmosQuery(COSMOS_QUERY_CLIENT)
      IS_FETCHING_COSMOS_QUERY = false
      return
    }

    try {
      const rpcEndpoint = await getRpcEndpoint()
      const client = await cosmos.ClientFactory.createRPCQueryClient({
        rpcEndpoint,
      })

      if (!!client.cosmos) {
        COSMOS_QUERY_CLIENT = client.cosmos
        setCosmosQuery(client.cosmos)
      } else {
        setTimeout(fetchCosmosQuery, 1000)
      }
    } catch (error) {
      console.error(error)
    } finally {
      IS_FETCHING_COSMOS_QUERY = false
    }
  }, [getRpcEndpoint])

  useEffect(() => {
    !cosmosQuery && fetchCosmosQuery()
  }, [cosmosQuery, fetchCosmosQuery])

  return (
    <CosmosQueryContext.Provider value={{ cosmosQuery }}>
      {children}
    </CosmosQueryContext.Provider>
  )
}

export const useCosmosQueryContext = () => {
  const context = useContext(CosmosQueryContext)

  if (!context) {
    throw new Error(
      'useCosmosQueryContext must be used within an CosmosQueryContext',
    )
  }

  return context
}
