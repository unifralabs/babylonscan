import { PropsWithChildren } from 'react'

import { type Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { formatPageTitle } from '@cosmoscan/shared/utils'
import { PageContainer } from '@cosmoscan/ui/layouts'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.VerifyContract')
  return {
    title: formatPageTitle(t('title')),
  }
}

export default async function Layout({ children }: PropsWithChildren) {
  const t = await getTranslations('Contract')
  return (
    <PageContainer
      title={
        <div className="flex-items-c flex-wrap gap-5">
          {t('verifyContract')}
        </div>
      }
    >
      {children}
    </PageContainer>
  )
}
