import { createElement } from 'react'

import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import BlockSignatureModal from '../../components/block/block-signature-modal'
import { serverApi } from '../../trpc/server'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { BASE_ROUTES } from '@cosmoscan/shared/constants/routes'
import { BlockStatusDict, BlockStatusEnum } from '@cosmoscan/shared/types'
import {
  cn,
  formatNumWithCommas,
  formatPageTitle,
  formatTimeAgo,
  formatUTCTime,
  generatePath,
} from '@cosmoscan/shared/utils'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import CopyWrapper from '@cosmoscan/ui/components/copy-wrapper'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import { StatisticalDataCards } from '@cosmoscan/ui/components/statistical-data-card'
import { EditIcon } from '@cosmoscan/ui/icons/edit'
import {
  BlockIcon,
  DbIcon,
  GasIcon,
  TransactionsIcon,
} from '@cosmoscan/ui/icons/statistical'
import { XmindIcon } from '@cosmoscan/ui/icons/xmind'
import { PageContainer } from '@cosmoscan/ui/layouts'
import { Tooltip } from '@cosmoscan/ui/tooltip'

export interface BlockDetailProps {
  params: {
    height: string
  }
}

export async function generateMetadata({
  params: { height },
}: BlockDetailProps): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.Block')
  return {
    title: formatPageTitle(t('title', { height })),
  }
}

export default async function BlockDetail({ params }: BlockDetailProps) {
  const locale = await getLocale()
  const t = await getTranslations('Block')
  const commonT = await getTranslations('Common')

  // Validate block height is a valid positive integer
  const height = params.height
  if (!/^\d+$/.test(height)) {
    notFound()
  }
  const blockHeight = Number(height)

  const [latestBlock, blockDetail] = await Promise.all([
    serverApi.internal.block.fetchLatestBlock(),
    serverApi.internal.block.fetchBlockDetail(blockHeight),
  ])

  if (!blockDetail) {
    notFound()
  }

  const renderBlockLink = (type: 'pre' | 'next') => {
    const icon = createElement(type === 'pre' ? ChevronLeft : ChevronRight, {
      className: 'h-5 w-5',
    })
    const height = blockHeight + (type === 'pre' ? -1 : 1)
    const isDisabled =
      (blockHeight === latestBlock && type === 'next') ||
      (blockHeight === 1 && type === 'pre')
    const linkClass = cn(
      'border-foreground flex-c h-8 w-8 rounded-md border',
      isDisabled
        ? 'pointer-events-none opacity-50'
        : 'text-foreground hover:bg-foreground hover:text-primary-foreground',
    )

    return isDisabled ? (
      <div className={linkClass}>{icon}</div>
    ) : (
      <Link
        className={linkClass}
        href={generatePath(BASE_ROUTES.blockchain.blocks.detail, {
          params: { height },
        })}
      >
        {icon}
      </Link>
    )
  }

  const BlockTransactions = !!blockDetail.num_txs ? (
    <ExternalLinkRenderer
      type="transactionsByBlock"
      query={{ block: blockHeight }}
      content={formatNumWithCommas(blockDetail.num_txs)}
      short={false}
    />
  ) : (
    (blockDetail.num_txs ?? 0)
  )

  const BlockGas = `${formatNumWithCommas(blockDetail.gas_used ?? 0)} / ${formatNumWithCommas(blockDetail.gas_wanted ?? 0)}`

  const BlockTotalReward = BigInt(
    Number(blockDetail.fp_reward ?? 0) +
      Number(blockDetail.staker_reward ?? 0) +
      Number(blockDetail.validator_reward ?? 0),
  )

  const statisticalItems = [
    {
      icon: TransactionsIcon,
      label: t('transactions'),
      value: BlockTransactions,
    },
    {
      icon: BlockIcon,
      label: t('blockReward'),
      value: <AmountLabel amount={BlockTotalReward} isChainNativeToken />,
    },
    {
      icon: DbIcon,
      label: t('size'),
      value: formatNumWithCommas(blockDetail.size ?? 0),
    },
    {
      icon: GasIcon,
      label: t('gas'),
      value: BlockGas,
    },
  ]

  const detailItems = [
    {
      label: t('blockReward'),
      tooltip: t('blockRewardTooltip'),
      value: (
        <div className="flex-items-c flex-col whitespace-nowrap md:flex-row md:gap-2">
          <AmountLabel amount={BlockTotalReward} isChainNativeToken />
          {CURRENT_CHAIN.isBabylon && (
            <div className="flex-items-c w-full flex-col gap-2 md:flex-row">
              <XmindIcon className="text-primary h-24 w-20 rotate-90 md:h-16 md:w-12 md:rotate-0" />
              <div className="flex w-full gap-2 md:flex-col">
                {[
                  { label: 'Finality Provider', valueKey: 'fp_reward' },
                  { label: 'BTC Staker', valueKey: 'staker_reward' },
                  { label: 'Validator', valueKey: 'validator_reward' },
                ].map(({ label, valueKey }) => (
                  <div
                    key={valueKey}
                    className="flex-items-c flex-1 flex-col gap-2 text-center text-sm md:flex-auto md:flex-row md:gap-4 md:text-left md:text-base"
                  >
                    <div className="text-foreground/60 md:min-w-40">
                      {label}
                    </div>
                    <AmountLabel
                      amount={BigInt(
                        Number(
                          blockDetail[valueKey as keyof typeof blockDetail] ??
                            0,
                        ),
                      )}
                      isChainNativeToken
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: t('hash'),
      tooltip: t('hashTooltip'),
      value: (
        <CopyWrapper
          classNames={{ root: 'break-all' }}
          copyText={blockDetail.hash}
        >
          {blockDetail.hash}
        </CopyWrapper>
      ),
    },
    {
      label: t('round'),
      tooltip: t('roundTooltip'),
      value: blockDetail.round ?? '-',
    },
    {
      label: t('transactions'),
      tooltip: t('transactionsTooltip'),
      value: BlockTransactions,
    },
    {
      label: t('gas'),
      tooltip: t('gasTooltip'),
      value: BlockGas,
    },
  ]

  return (
    <PageContainer
      title={
        <div className="flex-items-c gap-4">
          <span>{t('block')}</span>
          <span>{`#${formatNumWithCommas(blockHeight)}`}</span>
          <div className="flex-items-c gap-2">
            {renderBlockLink('pre')}
            {renderBlockLink('next')}
          </div>
        </div>
      }
    >
      <PageCardTitle>{commonT('overview')}</PageCardTitle>

      <StatisticalDataCards
        className="mb-gap gap-gap grid w-full grid-cols-1 md:grid-cols-2 2xl:grid-cols-4"
        items={statisticalItems}
      />

      <Card className="p-gap">
        <div className="flex-items-c gap-4">
          <span className="text-2xl font-medium">
            {formatNumWithCommas(blockHeight)}
          </span>
          <div className="flex-items-c bg-secondary/80 gap-3 rounded-md px-4 py-2">
            <BlockSignatureModal blockHeight={blockHeight}>
              <span className="text-primary cursor-pointer hover:underline">
                {BlockStatusDict[blockDetail.status as BlockStatusEnum]}
              </span>
            </BlockSignatureModal>
            <Tooltip content={t('validatorsTip')}>
              <div className="flex-c text-foreground/40 gap-2">
                <EditIcon className="h-5 w-3" />
                <span>
                  {blockDetail?.signed_validators ?? 0} /{' '}
                  {blockDetail?.total_validators ?? 0}
                </span>
              </div>
            </Tooltip>
          </div>
        </div>

        <div className="mb-6 mt-4 flex flex-wrap gap-6">
          <span>
            {formatTimeAgo(blockDetail.timestamp, locale)} (
            {formatUTCTime(blockDetail.timestamp)})
          </span>
          {!!blockDetail?.proposer_address && (
            <div className="flex gap-2">
              <span>{t('proposer')}</span>
              <ExternalLinkRenderer
                type="validator"
                content={
                  blockDetail.proposer_name || blockDetail.proposer_address
                }
                pathParamValue={blockDetail.proposer_address}
                short={!blockDetail.proposer_name}
              />
            </div>
          )}
        </div>

        <div className="bg-secondary p-gap rounded-lg">
          <DetailItems items={detailItems} />
        </div>
      </Card>
    </PageContainer>
  )
}
