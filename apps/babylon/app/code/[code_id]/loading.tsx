import { getTranslations } from 'next-intl/server'

import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import { DetailItemsSkeleton } from '@cosmoscan/ui/components/detail-items'
import { PageContainer } from '@cosmoscan/ui/layouts'
import { Separator } from '@cosmoscan/ui/separator'
import { Skeleton } from '@cosmoscan/ui/skeleton'

export default async function Loading() {
  const t = await getTranslations('Contract')
  const commonT = await getTranslations('Common')

  const items = [
    [
      t('verified'),
      t('codeId'),
      t('checksum'),
      t('creatorAccount'),
      t('permission'),
    ],
  ]

  return (
    <>
      <PageContainer
        title={
          <div className="flex-items-c gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-56" />
          </div>
        }
      >
        <PageCardTitle>{commonT('overview')}</PageCardTitle>
        <Card className="p-gap flex flex-col">
          {items.map((item, index) => (
            <div key={index}>
              {!!index && <Separator className="my-gap" />}
              <DetailItemsSkeleton items={item} />
            </div>
          ))}
        </Card>

        <Card className="mt-gap p-gap gap-gap flex flex-col">
          <Skeleton className="h-12 w-32" />
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex-bt-c gap-2">
              <Skeleton className="h-8 w-1/5" />
              <Skeleton className="h-8 w-1/5" />
            </div>
          ))}
        </Card>
      </PageContainer>
    </>
  )
}
