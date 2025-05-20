'use client'

import { PropsWithChildren } from 'react'

import { DEFAULT_THEME, ENABLE_SYSTEM_THEME } from '../constants/common'
import { CommonStoreProvider } from './common-store-provider'
import { ThemeProvider } from 'next-themes'

import { Toaster } from '@cosmoscan/ui/sonner'

export type SystemProviderProps = PropsWithChildren<{
  defaultTheme?: 'light' | 'dark' | 'system'
  enableSystemTheme?: boolean
}>

export default function SystemProvider({
  defaultTheme = DEFAULT_THEME,
  enableSystemTheme = ENABLE_SYSTEM_THEME,
  children,
}: SystemProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystemTheme}
      disableTransitionOnChange
    >
      <CommonStoreProvider>{children}</CommonStoreProvider>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}
