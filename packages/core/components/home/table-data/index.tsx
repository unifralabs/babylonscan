import { serverApi } from '../../../trpc/server'
import ExternalLinkRenderer from '../../external-link-renderer'
import {
  TableMempoolHashCell,
  TransactionTypesCell,
} from '../../table-cell-renderer'
import { Search } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { ChainTypeEnum, CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import {
  cn,
  formatNumWithCommas,
  formatTimeAgo,
  intlFormatNum,
} from '@cosmoscan/shared/utils'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import ChainLogo from '@cosmoscan/ui/components/chain-logo'
import IncreaseLabel from '@cosmoscan/ui/components/increase-label'
import Token from '@cosmoscan/ui/components/token'
import { Skeleton } from '@cosmoscan/ui/skeleton'

const CONSTANT = {
  dataNum: 5,
  itemHeight: '6rem',
  itemClass: 'md:h-24 min-h-24',
}

async function EmptyContent() {
  const t = await getTranslations('Common')
  return (
    <div
      style={{ height: `calc(${CONSTANT.dataNum} * ${CONSTANT.itemHeight})` }}
      className="flex-c gap-3"
    >
      <Search size={14} />
      <span>{t('noData')}</span>
    </div>
  )
}

export function StakingTrendingSkeletonTable() {
  return (
    <div>
      {[...Array(1)].map((_, index) => (
        <div key={index}>
          <div className="flex-bt-c h-24">
            <div className="flex-items-c flex-1 shrink-0 gap-4 md:flex-initial">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-24 flex-1 rounded-lg md:flex-initial" />
            </div>
            <Skeleton className="hidden h-6 w-52 rounded-lg md:block" />
            <Skeleton className="hidden h-6 w-14 rounded-lg md:block" />
          </div>
        </div>
      ))}
    </div>
  )
}

export async function TrendingChainsTable() {
  const items = [
    {
      logo: <ChainLogo type={ChainTypeEnum.BABYLON} withText={false} />,
      name: 'Babylon',
      token: {
        name: CURRENT_CHAIN.nativeToken.name,
        usd_price: '8.88',
        symbol: 8,
      },
      tvl: '11000000023',
      increase: -0.04,
    },
  ]

  return !!!items?.length ? (
    <EmptyContent />
  ) : (
    <div>
      {items?.map(({ logo, name, token, tvl, increase }) => (
        <div
          key={name}
          className={cn(
            'flex-bt-c border-secondary flex-wrap border-b last:border-0 md:border-0',
            CONSTANT.itemClass,
          )}
        >
          <div className="flex-items-c gap-4">
            <div className="flex-c h-8 w-8 shrink-0 rounded-full md:h-10 md:w-10">
              {logo || <Skeleton className="w-h-full rounded-full" />}
            </div>
            <span>{name}</span>
          </div>

          <div className="flex-c gap-1">
            <span>{token?.name}</span>
            <span>${token?.usd_price}</span>
          </div>

          <div className="flex-items-c -mt-3 w-full justify-between gap-2 md:mt-0 md:w-fit md:justify-start">
            <span>TVL ${intlFormatNum(tvl, { withSpace: true })}</span>
            <IncreaseLabel value={increase} />
          </div>
        </div>
      ))}
    </div>
  )
}

export async function TrendingAssetsTable() {
  const t = await getTranslations('Home')
  const items = [
    {
      logo: '',
      name: CURRENT_CHAIN.nativeToken.name,
      market_cap: '214579550031',
      increase: 0.04,
    },
  ]

  return !!!items?.length ? (
    <EmptyContent />
  ) : (
    <div>
      {items?.map(({ logo, name, market_cap, increase }) => (
        <div
          key={name}
          className={cn(
            'flex-bt-c border-secondary relative flex-wrap border-b last:border-0 md:border-0',
            CONSTANT.itemClass,
          )}
        >
          <Token
            classNames={{ root: 'h-8 w-8 md:h-10 md:w-10' }}
            logo={logo}
            name={name}
          />

          <div className="flex-c -mt-3 w-full justify-between gap-2 md:mt-0 md:w-fit md:justify-start">
            <span className="">{t('marketCap')}</span>
            <span>${formatNumWithCommas(market_cap)}</span>
          </div>

          <IncreaseLabel
            classNames={{
              root: 'absolute right-0 top-4 md:relative md:right-auto md:top-auto',
            }}
            value={increase}
          />
        </div>
      ))}
    </div>
  )
}

export function StakingTransactionsSkeletonTable() {
  return (
    <div>
      {[...Array(CONSTANT.dataNum)].map((_, index) => (
        <div key={index}>
          <div className="flex-c h-14 w-full md:hidden">
            <Skeleton className="h-6 w-full rounded-lg" />
          </div>

          <div className="md:flex-bt-c hidden h-24 gap-12 rounded-lg px-3">
            <div className="flex-items-c shrink-0 gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-6 w-52 rounded-lg" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>

            <div className="pb-7">
              <Skeleton className="h-6 w-14 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export async function StakingTransactionsTable() {
  const locale = await getLocale()
  const t = await getTranslations()
  const { items } =
    await serverApi.internal.staking.fetchInfiniteStakingTransactions({
      take: CONSTANT.dataNum,
    })

  return !!!items?.length ? (
    <EmptyContent />
  ) : (
    <div>
      {items?.map(
        ({
          staking_tx_hash,
          btc_address,
          status_desc,
          total_sat,
          staking_timestamp,
        }) => (
          <div
            key={staking_tx_hash}
            className={cn(
              'flex-bt-c md:odd:bg-secondary border-secondary relative h-fit gap-12 whitespace-nowrap border-b py-4 transition-colors last:border-0 md:rounded-lg md:border-0 md:px-3 md:py-0',
              CONSTANT.itemClass,
            )}
          >
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:gap-12">
              <div className="flex-items-c shrink-0 gap-4">
                <div className="bg-background flex-c text-primary h-6 w-6 shrink-0 rounded-full text-xs md:h-10 md:w-10 md:text-base">
                  Tx
                </div>
                <div className="-ml-2 flex flex-1 flex-row items-center justify-between gap-2 md:ml-0 md:flex-auto md:flex-col md:items-start md:justify-start md:gap-1">
                  <TableMempoolHashCell
                    type="tx"
                    hash={staking_tx_hash}
                    shortOptions={{ start: 6, end: 6 }}
                  />
                  <span className="text-sm md:text-base">
                    {formatTimeAgo(staking_timestamp, locale)}
                  </span>
                </div>
              </div>

              <div className="flex-truncate flex flex-1 flex-row items-start gap-2 md:flex-col md:gap-1">
                <div className="flex gap-2">
                  <div className="shrink-0">{t('Home.staker')}</div>
                  {!!btc_address ? (
                    <TableMempoolHashCell
                      type="address"
                      hash={btc_address}
                      shortOptions={{ start: 6, end: 6 }}
                    />
                  ) : (
                    '-'
                  )}
                </div>
                <div className="text-sm capitalize md:text-base">
                  {!!status_desc?.toLowerCase()
                    ? t(`Common.${status_desc?.toLowerCase()}`)
                    : '-'}
                </div>
              </div>
            </div>

            <div className="bg-secondary absolute bottom-4 right-0 h-fit shrink-0 rounded px-2 py-1 text-sm md:relative md:bottom-auto md:bg-transparent md:p-0 md:pb-7 md:text-base">
              <AmountLabel amount={BigInt(Number(total_sat ?? 0))} />
            </div>
          </div>
        ),
      )}
    </div>
  )
}

export function BlocksSkeletonTable() {
  return (
    <div>
      {[...Array(CONSTANT.dataNum)].map((_, index) => (
        <div key={index}>
          <div className="flex-c h-14 w-full md:hidden">
            <Skeleton className="h-6 w-full rounded-lg" />
          </div>

          <div className="md:flex-bt-c hidden h-24 gap-12 rounded-lg px-3">
            <div className="flex-items-c shrink-0 gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-6 w-52 rounded-lg" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>

            <div className="pb-7">
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>

            <div className="pb-7">
              <Skeleton className="h-6 w-14 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export async function BlocksTable() {
  const locale = await getLocale()
  const t = await getTranslations('Home')
  const [{ items }, averageBlockTime] = await Promise.all([
    serverApi.internal.block.fetchInfiniteBlocks({
      take: CONSTANT.dataNum,
    }),
    serverApi.internal.stat.fetchAverageBlockTime(),
  ])

  return !!!items?.length ? (
    <EmptyContent />
  ) : (
    <div>
      {items?.map(
        ({
          num_txs,
          proposer_address,
          height,
          timestamp,
          signed_validators,
          total_validators,
          fp_reward,
          staker_reward,
          validator_reward,
        }) => (
          <div
            key={height}
            className={cn(
              'flex-bt-c md:odd:bg-secondary border-secondary relative h-fit gap-12 whitespace-nowrap border-b py-4 transition-colors last:border-0 md:rounded-lg md:border-0 md:px-3 md:py-0',
              CONSTANT.itemClass,
            )}
          >
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:gap-12">
              <div className="flex-items-c min-w-48 shrink-0 gap-4">
                <div className="bg-background flex-c text-primary h-6 w-6 shrink-0 rounded-full text-xs md:h-10 md:w-10 md:text-base">
                  Bk
                </div>
                <div className="-ml-2 flex flex-1 flex-row items-center justify-between gap-2 md:ml-0 md:flex-auto md:flex-col md:items-start md:justify-start md:gap-1">
                  <ExternalLinkRenderer type="block" content={height} />
                  <span className="text-sm md:text-base">
                    {formatTimeAgo(timestamp, locale)}
                  </span>
                </div>
              </div>

              <div className="flex min-w-56 flex-row items-start gap-2 md:flex-col md:gap-1">
                <div className="flex gap-2">
                  <div className="shrink-0">{t('proposer')}</div>
                  {!!proposer_address ? (
                    <ExternalLinkRenderer
                      type="validator"
                      content={proposer_address}
                      shortOptions={{ start: 6, end: 6 }}
                    />
                  ) : (
                    '-'
                  )}
                </div>
                <div className="flex-items-c gap-2 text-sm md:text-base">
                  {!!num_txs ? (
                    <ExternalLinkRenderer
                      type="transactionsByBlock"
                      content={`${num_txs} ${t('txns')}`}
                      query={{ block: height }}
                    />
                  ) : (
                    `0 ${t('txns')}`
                  )}
                  <span>{`in ${averageBlockTime}${t('secs')}`}</span>
                </div>
              </div>

              <div>{`${signed_validators ?? 0} / ${total_validators ?? 0} ${t('signed')}`}</div>
            </div>

            <div className="bg-secondary absolute bottom-4 right-0 h-fit shrink-0 rounded px-2 py-1 text-sm md:relative md:bottom-auto md:bg-transparent md:p-0 md:pb-7 md:text-base">
              <AmountLabel
                amount={BigInt(
                  Number(fp_reward ?? 0) +
                    Number(staker_reward ?? 0) +
                    Number(validator_reward ?? 0),
                )}
                isChainNativeToken
              />
            </div>
          </div>
        ),
      )}
    </div>
  )
}

export function TransactionsSkeletonTable() {
  return (
    <div>
      {[...Array(CONSTANT.dataNum)].map((_, index) => (
        <div key={index}>
          <div className="flex-c h-14 w-full md:hidden">
            <Skeleton className="h-6 w-full rounded-lg" />
          </div>

          <div className="md:flex-bt-c hidden h-24 gap-12 rounded-lg px-3">
            <div className="flex-items-c shrink-0 gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-6 w-52 rounded-lg" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>

            <div className="pb-7">
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>

            <div className="pb-7">
              <Skeleton className="h-6 w-14 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export async function TransactionsTable() {
  const locale = await getLocale()
  const t = await getTranslations('Home')
  const { items } =
    await serverApi.internal.transaction.fetchInfiniteTransactions({
      take: CONSTANT.dataNum,
      filter: {},
    })

  return !!!items?.length ? (
    <EmptyContent />
  ) : (
    <div>
      {items?.map(
        ({ hash, height, timestamp, message_types, status, amount }) => (
          <div
            key={hash}
            className={cn(
              'flex-bt-c md:odd:bg-secondary border-secondary relative h-fit gap-12 whitespace-nowrap border-b py-4 transition-colors last:border-0 md:rounded-lg md:border-0 md:px-3 md:py-0',
              CONSTANT.itemClass,
            )}
          >
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:gap-12">
              <div className="flex-items-c min-w-48 shrink-0 gap-4">
                <div className="bg-border flex-c text-primary h-6 w-6 shrink-0 rounded-full text-xs md:h-10 md:w-10 md:text-base">
                  Tx
                </div>
                <div className="-ml-2 flex flex-1 flex-row items-center justify-between gap-2 md:ml-0 md:flex-auto md:flex-col md:items-start md:justify-start md:gap-1">
                  <ExternalLinkRenderer
                    type="transaction"
                    content={hash}
                    shortOptions={{ start: 6, end: 6 }}
                  />
                  <span className="text-sm md:text-base">
                    {formatTimeAgo(timestamp, locale)}
                  </span>
                </div>
              </div>

              <div className="flex w-36 shrink-0 flex-row items-start gap-2 md:flex-col md:gap-1">
                <div className="flex gap-2">
                  <div className="shrink-0">{t('block')}</div>
                  <ExternalLinkRenderer type="block" content={height} />
                </div>
                <div className="flex-items-c gap-2 text-sm md:text-base">
                  {0 === Number(status) ? t('success') : t('failed')}
                </div>
              </div>

              <div className="flex-truncate">
                <TransactionTypesCell
                  types={message_types}
                  withBorder={false}
                />
              </div>
            </div>

            <div className="bg-secondary absolute bottom-4 right-0 h-fit shrink-0 rounded px-2 py-1 text-sm md:relative md:bottom-auto md:bg-transparent md:p-0 md:pb-7 md:text-base">
              <AmountLabel
                amount={BigInt(Number(amount ?? 0))}
                isChainNativeToken
              />
            </div>
          </div>
        ),
      )}
    </div>
  )
}
