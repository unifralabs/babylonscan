import { type Metadata } from 'next'

import ContractHistory from '../../../components/contract/contract-history'
import { getTranslations } from 'next-intl/server'

import AddressTransactions from '@cosmoscan/core/components/address/transactions'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import {
  AddressActionWrapper,
  InvalidAddressContent,
} from '@cosmoscan/core/pages/address'
import { formatPageTitle } from '@cosmoscan/shared/utils'
import { isValidBTCAddress } from '@cosmoscan/shared/utils/btc'
import { isValidAddress } from '@cosmoscan/shared/utils/chain'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import BlockieAvatar from '@cosmoscan/ui/components/blockie-avatar'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import PageLinkTabs from '@cosmoscan/ui/components/page-link-tabs'

import { serverApi } from '@/trpc/server'

export interface ContractDetailProps {
  params: {
    address: string
  }
  searchParams: {
    tab?: string
  }
}

export async function generateMetadata({
  params: { address },
}: ContractDetailProps): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.Contract')
  return {
    title: formatPageTitle(t('title', { address })),
    description: t('description', { address }),
  }
}

export default async function ContractDetail({ params }: ContractDetailProps) {
  const t = await getTranslations('Contract')
  const commonT = await getTranslations('Common')
  const address = params.address.toLowerCase()
  const _isValidAddress = isValidAddress(address) || isValidBTCAddress(address)
  if (!_isValidAddress) return <InvalidAddressContent address={address} />

  const [contractDetail, contractExecutionCount] = await Promise.all([
    serverApi.internal.contract.fetchContractDetail(address),
    serverApi.internal.contract.fetchContractExecutionCount(address),
  ])

  const detailItems = [
    {
      label: t('label'),
      value: contractDetail?.label,
    },
    {
      label: t('creatorAccount'),
      value: (
        <ExternalLinkRenderer
          type="address"
          content={contractDetail?.creator || ''}
          short={true}
        />
      ),
    },
    {
      label: t('codeId'),
      value: (
        <ExternalLinkRenderer
          type="code"
          content={contractDetail?.code_id || ''}
        />
      ),
    },
    {
      label: t('initialBlock'),
      value: (
        <ExternalLinkRenderer
          type="block"
          content={contractDetail?.creation_height || ''}
        />
      ),
    },
    {
      label: t('adminAccount'),
      value:
        contractDetail?.admin !== '' ? (
          <ExternalLinkRenderer
            type="address"
            content={contractDetail?.admin || ''}
            short={true}
          />
        ) : (
          '-'
        ),
    },
    {
      label: t('executionCount'),
      value: contractExecutionCount,
    },
  ]

  return (
    <>
      <div className="flex-items-c mb-page-gap gap-4">
        <BlockieAvatar className="h-14 w-14" address={address} />

        <div className="flex flex-col">
          <AddressActionWrapper address={address} />
        </div>
      </div>

      <PageCardTitle>{commonT('overview')}</PageCardTitle>
      <Card className="p-gap mb-gap">
        <DetailItems items={detailItems} />
      </Card>

      <Card className="p-gap">
        <PageLinkTabs
          queryKey="tab"
          tabs={[
            {
              value: 'history',
              valueContent: t('history'),
              content: <ContractHistory contract_address={address} />,
            },
            {
              value: 'transactions',
              valueContent: t('transactions'),
              content: <AddressTransactions address={address} />,
            },
          ]}
        />
      </Card>
    </>
  )
}
