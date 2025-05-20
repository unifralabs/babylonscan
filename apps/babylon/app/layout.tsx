import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { getLocale } from 'next-intl/server'

import RootProvider from '@cosmoscan/core/providers/root'
import { cn } from '@cosmoscan/shared/utils'
import { Container } from '@cosmoscan/ui/layouts'

import '@cosmoscan/config-tailwindcss/shadcn.css'

import { PropsWithChildren } from 'react'


import { MENU_DATA } from '@/constants/menu'

const groteskFont = localFont({
  variable: '--font-sans',
  src: '../fonts/Px-Grotesk-Regular.woff2',
})

export const metadata: Metadata = {
  title: process.env.COSMOSCAN_PUBLIC_WEBSITE_TITLE,
  description: process.env.COSMOSCAN_PUBLIC_WEBSITE_METADATA_DESCRIPTION,
  keywords: process.env.COSMOSCAN_PUBLIC_WEBSITE_METADATA_KEYWORDS,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang={await getLocale()} suppressHydrationWarning>
      <body
        className={cn(
          'bg-background min-h-full font-sans antialiased',
          groteskFont.variable,
          groteskFont.className,
        )}
      >
        {await RootProvider({
          children: <Container menuData={MENU_DATA}>{children}</Container>,
        })}
      </body>
    </html>
  )
}
