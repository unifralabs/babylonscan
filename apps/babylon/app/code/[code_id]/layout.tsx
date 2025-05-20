import { PropsWithChildren } from 'react'

import { getTranslations } from 'next-intl/server'

import { PageContainer } from '@cosmoscan/ui/layouts'

export default async function Layout({ children }: PropsWithChildren) {
  const t = await getTranslations('Contract')
  return <PageContainer title={t('contractDetails')}>{children}</PageContainer>
}
