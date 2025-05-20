import { type Metadata } from 'next'

import TokenTopHoldersTable from '../../../components/token/top-holders-table'
import { FileDigit, Type } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { TokenDetailAvatarNameWrapper } from '@cosmoscan/core/components/tokens'
import { formatNumWithCommas, formatPageTitle } from '@cosmoscan/shared/utils'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import CopyWrapper from '@cosmoscan/ui/components/copy-wrapper'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import PageLinkTabs from '@cosmoscan/ui/components/page-link-tabs'
import { StatisticalDataCards } from '@cosmoscan/ui/components/statistical-data-card'
import { PeopleIcon, StakeIcon } from '@cosmoscan/ui/icons/statistical'
import { PageContainer } from '@cosmoscan/ui/layouts'
import { Separator } from '@cosmoscan/ui/separator'

import { serverApi } from '@/trpc/server'

export interface TokenDetailParams {
  params: {
    denom: string
  }
}

export async function generateMetadata({
  params: { denom },
}: TokenDetailParams): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.Token')
  // Decode the denom parameter for metadata
  const decodedDenom = decodeURIComponent(denom)
  return {
    title: formatPageTitle(t('title', { denom: decodedDenom })),
    description: t('description', { denom: decodedDenom }),
  }
}

export default async function TokenDetail({ params }: TokenDetailParams) {
  const t = await getTranslations('Token')
  const commonT = await getTranslations('Common')

  // Decode the denom parameter to handle URL-encoded values
  const decodedDenom = decodeURIComponent(params.denom)

  const tokenDetail = await serverApi.internal.token.fetchTokenDetailByDenom(
    decodedDenom
  )

  const statisticalItems = [
    {
      icon: StakeIcon,
      label: t('maxTotalSupply'),
      value: tokenDetail?.total_supply ? formatNumWithCommas(tokenDetail.total_supply) : '-',
    },
    {
      icon: PeopleIcon,
      label: t('holders'),
      value: tokenDetail?.holders ? formatNumWithCommas(tokenDetail.holders) : '-',
    },
    {
      icon: Type,
      label: t('type'),
      value: tokenDetail?.type || '-',
    },
    {
      icon: FileDigit,
      label: t('decimals'),
      value: tokenDetail?.decimals !== undefined && tokenDetail?.decimals !== null 
        ? tokenDetail.decimals 
        : '-',
    },
  ]

  const items = [
    [
      {
        label: t('denom'),
        value: (
          <CopyWrapper copyText={tokenDetail?.denom}>
            <ExternalLinkRenderer
              type="token"
              content={tokenDetail?.denom}
              short={false}
            />
          </CopyWrapper>
        ),
      },
    ],
  ]

  return (
    <PageContainer
      title={
        <div className="flex-items-c flex-wrap gap-4">
          <TokenDetailAvatarNameWrapper
            logo={tokenDetail?.logo || undefined}
            name={tokenDetail?.display_denom || '-'}
            symbol={tokenDetail?.symbol || '-'}
            denom={tokenDetail?.denom}
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

        <StatisticalDataCards
          className="mt-gap mb-gap gap-gap grid w-full grid-cols-1 md:grid-cols-2 2xl:grid-cols-4"
          items={statisticalItems}
        />
      </Card>

      <Card className="mt-gap p-gap">
        <PageLinkTabs
          queryKey="tab"
          defaultValue="holders"
          tabs={[
            {
              value: 'holders',
              valueContent: (
                <div className="flex-c gap-3">
                  <span>{t('topHolders')}</span>
                </div>
              ),
              content: (
                <TokenTopHoldersTable
                  denom={decodedDenom}
                  totalSupply={(tokenDetail?.total_supply || '0').toString()}
                  currency={tokenDetail?.display_denom || '-'}
                  decimals={tokenDetail?.decimals || 6}
                />
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  )
}
