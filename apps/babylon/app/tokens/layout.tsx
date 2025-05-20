import { PropsWithChildren } from 'react'

import { getTranslations } from 'next-intl/server'

import { PageContainer } from '@cosmoscan/ui/layouts'

export default async function Layout({ children }: PropsWithChildren) {
  const t = await getTranslations('Token')
  return <PageContainer title={t('tokenTracker')}>{children}</PageContainer>
}
