import { PropsWithChildren } from 'react'

import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getTranslations } from 'next-intl/server'

import { formatPageTitle } from '@cosmoscan/shared/utils'
import { PageContainer } from '@cosmoscan/ui/layouts'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.TopAccounts')
  return {
    title: formatPageTitle(t('title')),
  }
}

export default async function Layout({ children }: PropsWithChildren) {
  return notFound()
  const t = await getTranslations('Token')
  return <PageContainer title={t('topAccounts')}>{children}</PageContainer>
}
