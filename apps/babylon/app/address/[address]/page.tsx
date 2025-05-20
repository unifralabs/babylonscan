import { Suspense } from 'react'

import { type Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import {
  AddressAssetStats
} from '@cosmoscan/core/components/address'
import AddressDelegations from '@cosmoscan/core/components/address/delegations'
import AddressStakingTransactions from '@cosmoscan/core/components/address/staking-transactions'
import AddressTransactions from '@cosmoscan/core/components/address/transactions'
import {
  AddressActionWrapper,
  InvalidAddressContent,
} from '@cosmoscan/core/pages/address'
import { formatPageTitle } from '@cosmoscan/shared/utils'
import { isValidBTCAddress } from '@cosmoscan/shared/utils/btc'
import { isValidAddress } from '@cosmoscan/shared/utils/chain'
import { Badge } from '@cosmoscan/ui/badge'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import BlockieAvatar from '@cosmoscan/ui/components/blockie-avatar'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import PageLinkTabs from '@cosmoscan/ui/components/page-link-tabs'
import { PageContainer } from '@cosmoscan/ui/layouts'
import { Skeleton } from '@cosmoscan/ui/skeleton'

import ContractDetail from '@/app/contract/[address]/page'
import { serverApi } from '@/trpc/server'

export interface AddressDetailProps {
  params: {
    address: string
  }
  searchParams: {
    tab?: string
  }
}

export async function generateMetadata({
  params: { address },
}: AddressDetailProps): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.Address')
  return {
    title: formatPageTitle(t('title', { address })),
    description: t('description', { address }),
  }
}

export default async function AddressDetail({
  params,
  searchParams,
}: AddressDetailProps) {
  const t = await getTranslations('Address')
  const commonT = await getTranslations('Common')
  const address = params.address.toLowerCase()
  const _isValidAddress = isValidAddress(address) || isValidBTCAddress(address)
  if (!_isValidAddress) return <InvalidAddressContent address={address} />

  // redirect to contract detail page if the address is a contract
  const contractDetail =
    await serverApi.internal.contract.fetchContractDetail(address)
  if (contractDetail) {
    return <ContractDetail params={params} searchParams={searchParams} />
  }

  const addressDetail =
    await serverApi.internal.address.fetchAddressMetaData(address)
  const bbnAddress = addressDetail?.bbn_address || address
  const isBTCStaker = !!addressDetail?.btc_pk && !!addressDetail?.btc_address
  const btcAddress = addressDetail?.btc_address

  const detailItems = [
    {
      label: commonT('overview'),
      value: address.startsWith('bbn') ? (
        <Suspense fallback={<Skeleton className="h-6 w-32" />}>
          <AddressAssetStats address={address} />
        </Suspense>
      ) : (
        '-'
      ),
    },
   
  ]

  return (
    <PageContainer
      title={
        <div className="flex-items-c gap-5">
          <span>{t('addressDetails')}</span>
          {isBTCStaker && <Badge className="text-base">{t('btcStaker')}</Badge>}
        </div>
      }
    >
      <div className="flex-items-c mb-page-gap gap-4">
        <BlockieAvatar className="h-14 w-14" address={bbnAddress} />

        <div className="flex flex-col">
          <AddressActionWrapper address={bbnAddress} />
          {isBTCStaker && (
            <AddressActionWrapper
              title={`${t('btcAddress')}: ${btcAddress}`}
              address={btcAddress!}
            />
          )}
        </div>
      </div>

      <PageCardTitle>{commonT('overview')}</PageCardTitle>
      <Card className="p-gap mb-gap">
        <DetailItems items={detailItems} />
      </Card>

      <Card className="p-gap">
        <PageLinkTabs
          queryKey="tab"
          defaultValue={isBTCStaker ? 'staking' : 'transactions'}
          tabs={[
            ...(isBTCStaker && !!addressDetail?.btc_pk
              ? [
                  {
                    value: 'staking',
                    valueContent: t('staking'),
                    content: (
                      <AddressStakingTransactions address={bbnAddress} />
                    ),
                  },
                ]
              : []),
            {
              value: 'transactions',
              valueContent: t('transactions'),
              content: <AddressTransactions address={bbnAddress} />,
            },
            {
              value: 'delegations',
              valueContent: t('delegations'),
              content: <AddressDelegations address={bbnAddress} />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  )
}
