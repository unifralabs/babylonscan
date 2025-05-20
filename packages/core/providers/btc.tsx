'use client'

import { PropsWithChildren } from 'react'

import {
  BitgetConnector,
  ConnectProvider,
  OKXConnector,
  TokenPocketConnector,
  UnisatConnector,
  WizzConnector,
  XverseConnector,
} from '@particle-network/btc-connectkit'
import { chains } from '@particle-network/chains'
import { useTheme } from 'next-themes'

import { getAppResolvedTheme } from '@cosmoscan/shared/utils'

export type BTCConfig = {
  chainIds: number[]
  version: string
}

export const accountContracts = {
  BTC: chains
    .getAllChainInfos()
    .filter(chain =>
      chain.features?.some(
        feature =>
          feature.name === 'ERC4337' &&
          feature.contracts?.some(contract => contract.name === 'BTC'),
      ),
    )
    .reduce((value: BTCConfig[], current) => {
      const versins = current.features
        ?.find(feature => feature.name === 'ERC4337')
        ?.contracts?.filter(contract => contract.name === 'BTC')
        .map(contract => contract.version) as string[]
      versins.forEach(version => {
        const configItem = value.find(config => config.version === version)
        if (configItem) {
          configItem.chainIds.push(current.id)
        } else {
          value.push({
            version,
            chainIds: [current.id],
          })
        }
      })
      return value
    }, [] as BTCConfig[]),
}
export type ContractName = keyof typeof accountContracts

export default function BTCConnectProvider({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme()

  return (
    <ConnectProvider
      options={{
        projectId: '533de793-9b2f-448d-bfcd-b7da16c59ed8',
        clientKey: 'cbUVvHb0NWIgcft0LQOnlNoYHoFCVFy7veddFMRE',
        appId: 'a4defdc6-1846-4ea1-830a-26d1a1d7180f',
        aaOptions: {
          accountContracts,
        },
        walletOptions: {
          themeType: getAppResolvedTheme(resolvedTheme),
          visible: false,
        },
      }}
      connectors={[
        new UnisatConnector(),
        new OKXConnector(),
        new BitgetConnector(),
        new TokenPocketConnector(),
        new WizzConnector(),
        new XverseConnector(),
      ]}
      // autoConnect={false}
    >
      {children}
    </ConnectProvider>
  )
}
