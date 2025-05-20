'use client'

import type { ReactNode } from 'react'

import { networks, projectId, wagmiAdapter } from './config'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import {
  cookieToInitialState,
  WagmiProvider as WagmiBaseProvider,
  type Config,
} from 'wagmi'

import { getAppResolvedTheme } from '@cosmoscan/shared/utils'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const metadata = {
  name: 'Babylon',
  description: 'Babylon',
  url: 'https://babylon-testnet.l2scan.co',
  icons: [],
}

export default function WagmiProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null
}) {
  const { resolvedTheme } = useTheme()
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  )

  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    defaultNetwork: networks[0],
    metadata,
    themeMode: getAppResolvedTheme(resolvedTheme),
    themeVariables: {
      '--w3m-font-family': 'var(--font-inter)',
      '--w3m-accent': 'var(--primary)',
      '--w3m-font-size-master': '11px',
    },
    features: {
      analytics: false,
      onramp: false,
      email: false,
      socials: false,
    },
  })

  return (
    <WagmiBaseProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiBaseProvider>
  )
}
