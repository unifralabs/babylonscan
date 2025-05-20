import { PropsWithChildren } from 'react'

import { headers } from 'next/headers'

import { TRPCClientProvider } from '../trpc/react'
import BTCConnectProvider from './btc'
import CosmosProvider from './cosmos'
import { DialogStoreProvider } from './dialog'
import WagmiProvider from './wagmi'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import SystemProvider from '@cosmoscan/shared/providers/system-provider'

export default async function RootProvider({ children }: PropsWithChildren) {
  return (
    <NextIntlClientProvider messages={await getMessages()}>
      <SystemProvider>
        <TRPCClientProvider>
          <WagmiProvider cookies={headers().get('cookie')}>
                <BTCConnectProvider>
                  <CosmosProvider>
                    <DialogStoreProvider>{children}</DialogStoreProvider>
                  </CosmosProvider>
                </BTCConnectProvider>
          </WagmiProvider>
        </TRPCClientProvider>
      </SystemProvider>
    </NextIntlClientProvider>
  )
}
