import { PropsWithChildren } from 'react'

import { type Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { type FinalityProviderParams } from '@cosmoscan/core/pages/btc-finality-providers/detail'
import { formatPageTitle } from '@cosmoscan/shared/utils'

export async function generateMetadata({
  params: { address },
}: FinalityProviderParams): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.BtcFinalityProvider')
  return {
    title: formatPageTitle(t('title', { address: address.toUpperCase() })),
  }
}

export default function Layout({ children }: PropsWithChildren) {
  return children
}
