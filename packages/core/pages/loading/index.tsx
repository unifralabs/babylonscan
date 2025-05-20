import { getTranslations } from 'next-intl/server'

import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import { DetailItemsSkeleton } from '@cosmoscan/ui/components/detail-items'
import { StatisticalDataCards } from '@cosmoscan/ui/components/statistical-data-card'
import {
  BlockIcon,
  DbIcon,
  GasIcon,
  TransactionsIcon,
  ValueIcon,
} from '@cosmoscan/ui/icons/statistical'
import { PageContainer } from '@cosmoscan/ui/layouts'
import { Separator } from '@cosmoscan/ui/separator'
import { Skeleton } from '@cosmoscan/ui/skeleton'

export async function AddressDetailLoading() {
  const t = await getTranslations('Address')
  const commonT = await getTranslations('Common')

  return (
    <>
      <PageContainer title={t('addressDetails')}>
        <div className="flex-items-c mb-page-gap gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <PageCardTitle>{commonT('overview')}</PageCardTitle>
        <Card className="p-gap mb-gap gap-page-gap flex flex-col">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-3/5" />
        </Card>
        <Card className="p-gap mb-gap">
          <Skeleton className="mb-6 mt-4 h-6 w-56" />
          <Skeleton className="h-[40vh] w-full" />
        </Card>
      </PageContainer>
    </>
  )
}

export async function ContractDetailLoading() {
  const t = await getTranslations('Contract')
  const commonT = await getTranslations('Common')

  return (
    <>
      <PageContainer title={t('contractDetails')}>
        <div className="flex-items-c mb-page-gap gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <PageCardTitle>{commonT('overview')}</PageCardTitle>
        <Card className="p-gap mb-gap gap-page-gap flex flex-col">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-3/5" />
        </Card>
        <Card className="p-gap mb-gap">
          <Skeleton className="mb-6 mt-4 h-6 w-56" />
          <Skeleton className="h-[40vh] w-full" />
        </Card>
      </PageContainer>
    </>
  )
}

export async function BlockDetailLoading() {
  const t = await getTranslations('Block')
  const commonT = await getTranslations('Common')

  const statisticalItems = [
    {
      icon: TransactionsIcon,
      label: t('transactions'),
      value: <Skeleton className="h-6 w-32" />,
    },
    {
      icon: BlockIcon,
      label: t('blockReward'),
      value: <Skeleton className="h-6 w-32" />,
    },
    {
      icon: DbIcon,
      label: t('size'),
      value: <Skeleton className="h-6 w-32" />,
    },
    {
      icon: GasIcon,
      label: t('gas'),
      value: <Skeleton className="h-6 w-32" />,
    },
  ]

  return (
    <>
      <PageContainer
        title={
          <div className="flex-items-c gap-4">
            <div>{t('block')}</div>
            <Skeleton className="h-8 w-56" />
          </div>
        }
      >
        <PageCardTitle>{commonT('overview')}</PageCardTitle>
        <StatisticalDataCards
          className="mb-gap gap-gap grid w-full grid-cols-1 md:grid-cols-2 2xl:grid-cols-4"
          items={statisticalItems}
        />
        <Card className="p-gap">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mb-6 mt-4 h-6 w-56" />
          <Skeleton className="bg-secondary h-[30vh] w-full rounded-lg" />
        </Card>
      </PageContainer>
    </>
  )
}

export async function TxDetailLoading() {
  const t = await getTranslations('Transaction')

  const statisticalItems = [
    {
      icon: ValueIcon,
      label: t('value'),
      value: <Skeleton className="h-6 w-32" />,
    },
    {
      icon: TransactionsIcon,
      label: t('transactionFee'),
      value: <Skeleton className="h-6 w-32" />,
    },
    {
      icon: GasIcon,
      label: t('gas'),
      value: <Skeleton className="h-6 w-32" />,
    },
  ]

  return (
    <>
      <StatisticalDataCards
        className="mb-gap gap-gap grid w-full grid-cols-1 md:grid-cols-2 2xl:grid-cols-4"
        items={statisticalItems}
      />
      <Card className="p-gap mb-gap">
        <Skeleton className="mb-6 mt-4 h-6 w-56" />
        <Skeleton className="bg-secondary h-[10vh] w-full rounded-lg" />
      </Card>
      <PageCardTitle>{t('messages')}</PageCardTitle>
      <Skeleton className="bg-card h-[30vh] w-full rounded-lg shadow-sm" />
    </>
  )
}

export async function ValidatorDetailLoading() {
  const t = await getTranslations('Block')
  const commonT = await getTranslations('Common')

  const items = [
    [
      t('name'),
      t('operatorAddress'),
      t('ownerAddress'),
      t('website'),
      t('description'),
    ],
    [
      t('votingPower'),
      t('selfBonded'),
      t('uptime'),
      t('commission'),
      t('status'),
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
