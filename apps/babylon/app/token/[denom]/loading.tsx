import { getTranslations } from 'next-intl/server'

import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import { DetailItemsSkeleton } from '@cosmoscan/ui/components/detail-items'
import { StatisticalDataCards } from '@cosmoscan/ui/components/statistical-data-card'
import {
  BlockIcon,
  DbIcon,
  GasIcon,
  TransactionsIcon,
} from '@cosmoscan/ui/icons/statistical'
import { PageContainer } from '@cosmoscan/ui/layouts'
import { Separator } from '@cosmoscan/ui/separator'
import { Skeleton } from '@cosmoscan/ui/skeleton'

export default async function Loading() {
  const t = await getTranslations('Token')
  const commonT = await getTranslations('Common')

  const items = [[t('denom')]]

  const statisticalItems = [
    {
      icon: TransactionsIcon,
      label: t('maxTotalSupply'),
      value: <Skeleton className="h-6 w-32" />,
    },
    {
      icon: BlockIcon,
      label: t('holders'),
      value: <Skeleton className="h-6 w-32" />,
    },
    {
      icon: DbIcon,
      label: t('type'),
      value: <Skeleton className="h-6 w-32" />,
    },
    {
      icon: GasIcon,
      label: t('decimals'),
      value: <Skeleton className="h-6 w-32" />,
    },
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
          <StatisticalDataCards
            className="mt-gap mb-gap gap-gap grid w-full grid-cols-1 md:grid-cols-2 2xl:grid-cols-4"
            itemClassNames={{ item: 'bg-[#262324]', icon: 'hidden' }}
            items={statisticalItems}
          />
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
