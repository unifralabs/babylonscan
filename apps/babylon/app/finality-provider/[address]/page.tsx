
import { type Metadata } from 'next'
import Link from 'next/link'

import { getTranslations } from 'next-intl/server'

import type { FinalityProviderMetadata } from '@cosmoscan/core-api'
import AddressTransactions from '@cosmoscan/core/components/address/transactions'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import {
  FinalityProviderAvatarNameWrapper,
  FinalityProviderStatus,
} from '@cosmoscan/core/components/finality-provider'
import { FinalityProvidersStatusEnum } from '@cosmoscan/shared/types'
import { formatNumWithPercent, formatPageTitle } from '@cosmoscan/shared/utils'
import { Badge } from '@cosmoscan/ui/badge'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import CopyWrapper from '@cosmoscan/ui/components/copy-wrapper'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import PageLinkTabs from '@cosmoscan/ui/components/page-link-tabs'
import {
  AmountPercentLabel,
  PercentLabel,
} from '@cosmoscan/ui/components/percent-label'
import { PageContainer } from '@cosmoscan/ui/layouts'
import { Separator } from '@cosmoscan/ui/separator'

import FinalityProviderChainsSelect from '@/components/finality-provider/chain-select'
import FinalityProviderDelegationsTable from '@/components/finality-provider/delegations-table'
import FinalityProviderStakersTable from '@/components/finality-provider/stakers-table'
import { serverApi } from '@/trpc/server'

export interface FinalityProviderParams {
  params: {
    address: string
  }
}

export async function generateMetadata({
  params: { address },
}: FinalityProviderParams): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.FinalityProvider')
  return {
    title: formatPageTitle(t('title', { address: address.toUpperCase() })),
  }
}

export default async function FinalityProviderDetail({
  params,
}: FinalityProviderParams) {
  const t = await getTranslations('FinalityProvider')
  const commonT = await getTranslations('Common')
  const btcPK = params.address.toUpperCase()

  // Fetch all required data
  const [
    finalityProviderDetail,
    totalVotingPowerAndBonded,
  ] = await Promise.all([
    serverApi.internal.finalityProvider.fetchFinalityProviderDetail(btcPK),
    serverApi.internal.finalityProvider.fetchTotalFinalityProvidersVotingPowerAndBonded(),
  ])

  const finalityProviderDetailMetadata =
    finalityProviderDetail?.description as FinalityProviderMetadata

  const items = [
    [
      {
        label: t('address'),
        value: !!finalityProviderDetail?.babylon_address ? (
          <CopyWrapper copyText={finalityProviderDetail?.babylon_address}>
            <ExternalLinkRenderer
              type="address"
              content={finalityProviderDetail?.babylon_address}
              short={false}
            />
          </CopyWrapper>
        ) : (
          '-'
        ),
      },
      {
        label: t('btcPk'),
        value: (
          <CopyWrapper copyText={finalityProviderDetail?.btc_pk}>
            {finalityProviderDetail?.btc_pk}
          </CopyWrapper>
        ),
      },
      {
        label: t('totalDelegation'),
        value: (
          <AmountLabel
            amount={BigInt(Number(finalityProviderDetail?.total_sat ?? 0))}
          />
        ),
      },
      {
        label: t('commission'),
        value: formatNumWithPercent(finalityProviderDetail?.commission),
      },
      {
        label: t('website'),
        value: !!finalityProviderDetailMetadata?.website ? (
          <Link
            className="link"
            href={finalityProviderDetailMetadata?.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {finalityProviderDetailMetadata?.website}
          </Link>
        ) : (
          '-'
        ),
      },
      {
        label: t('description'),
        value: finalityProviderDetailMetadata?.details || '-',
      },
    ],
    [
      {
        label: t('votingPower'),
        value: (
          <AmountPercentLabel
            amount={BigInt(Number(finalityProviderDetail?.voting_power ?? 0))}
            percent={
              !!!totalVotingPowerAndBonded?.totalVotingPower
                ? 0
                : Number(finalityProviderDetail?.voting_power ?? 0) /
                  totalVotingPowerAndBonded?.totalVotingPower
            }
          />
        ),
      },
      {
        label: t('selfBonded'),
        value: (
          <AmountPercentLabel
            amount={BigInt(Number(finalityProviderDetail?.self_bonded ?? 0))}
            percent={
              !!!totalVotingPowerAndBonded?.totalBonded
                ? 0
                : Number(finalityProviderDetail?.self_bonded ?? 0) /
                  totalVotingPowerAndBonded?.totalBonded
            }
          />
        ),
      },
      {
        label: t('uptime'),
        value: (
          <PercentLabel percent={finalityProviderDetail?.uptime?.uptime}>
            {finalityProviderDetail?.uptime?.missedBlocks} blocks missed
          </PercentLabel>
        ),
      },
      {
        label: t('status'),
        value: (
          <FinalityProviderStatus
            status={
              finalityProviderDetail?.status as FinalityProvidersStatusEnum
            }
          />
        ),
      },
    ],
  ]


  return (
    <PageContainer
      title={
        <div className="flex-items-c flex-wrap gap-4">
          <FinalityProviderAvatarNameWrapper
            name={finalityProviderDetail?.name}
            address={btcPK}
            status={finalityProviderDetail?.status}
          />
          <FinalityProviderChainsSelect
            chains={finalityProviderDetail?.supported_chains}
          />
        </div>
      }
    >
      <PageCardTitle>{commonT('overview')}</PageCardTitle>
      <Card className="p-gap flex flex-col">
        {items.map((item, index) => (
          <div key={index}>
            {!!index && <Separator className="my-gap" />}
            <DetailItems key={index} items={item} />
          </div>
        ))}
      </Card>

      {/* <PageCardTitle className="mt-6">Signature Status</PageCardTitle>
      <Card className="p-gap">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {signatureStatusModules.map((module, moduleIndex) => (
            <div
              key={moduleIndex}
              className="rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20"
            >
              <DetailItems items={module.items} />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
          <h3 className="mb-4 text-sm font-medium">
            Uptime by latest 70 blocks
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <FinalityProviderSignatureHeatmap
                blocks={lastBlocksSignatures || []}
              />
            </div>
          </div>
        </div>
      </Card> */}

      <Card className="mt-gap p-gap">
        <PageLinkTabs
          queryKey="tab"
          defaultValue="stakers"
          tabs={[
            {
              value: 'stakers',
              valueContent: (
                <div className="flex-c gap-3">
                  <span>{t('stakers')}</span>
                  <Badge className="dark:bg-[#49240D]">
                    {finalityProviderDetail?.stakers ?? 0}
                  </Badge>
                </div>
              ),
              content: <FinalityProviderStakersTable address={btcPK} />,
            },
            {
              value: 'delegations',
              valueContent: (
                <div className="flex-c gap-3">
                  <span>{t('delegations')}</span>
                  <Badge className="dark:bg-[#49240D]">
                    {finalityProviderDetail?.delegations ?? 0}
                  </Badge>
                </div>
              ),
              content: (
                <FinalityProviderDelegationsTable address={params.address} />
              ),
            },
            {
              value: 'transactions',
              valueContent: t('transactions'),
              content: (
                <AddressTransactions
                  address={finalityProviderDetail?.babylon_address!}
                />
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  )
}
