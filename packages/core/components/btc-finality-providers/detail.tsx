'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { clientApi } from '../../trpc/react'
import { ColumnFiltersState } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { produce } from 'immer'
import { useTranslations } from 'next-intl'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  BtcFinalityProviderDailyStatisticalChartData,
  StakingTransactionsItem,
  type BtcFpStakingTransactionsInput,
} from '@cosmoscan/core-api'
import { StakingTransactionsTableColumns } from '@cosmoscan/core/pages/staking-transactions'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { StakingTransactionStakingStatusEnum } from '@cosmoscan/shared/types'
import {
  cn,
  formatBTC,
  formatNumWithCommas,
  formatNumWithPercent,
} from '@cosmoscan/shared/utils'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'
import IncreaseLabel from '@cosmoscan/ui/components/increase-label'
import { StatisticalDataCards } from '@cosmoscan/ui/components/statistical-data-card'
import {
  PeopleIcon,
  ProvidersIcon,
  StakeIcon,
} from '@cosmoscan/ui/icons/statistical'
import { Skeleton } from '@cosmoscan/ui/skeleton'

interface BtcFpDetailProps {
  address: string
  intervalDays?: number
}

export function BtcFpDetailStatisticalData({
  address,
  intervalDays,
}: BtcFpDetailProps) {
  const t = useTranslations('FinalityProvider')

  const { data, isLoading } =
    clientApi.internal.finalityProvider.fetchBtcFinalityProviderDetailStatisticalData.useQuery(
      { address, intervalDays },
      { enabled: !!address },
    )

  const StatisticalData = useMemo(
    () => [
      {
        icon: StakeIcon,
        label: t('totalDelegation'),
        value: isLoading ? (
          <Skeleton className="h-7 w-36" />
        ) : (
          <div className="flex-items-c gap-4">
            <AmountLabel amount={BigInt(Number(data?.total_sat ?? 0))} />
            {!!data?.stakers_growth_percentage && (
              <IncreaseLabel value={data?.stakers_growth_percentage / 100} />
            )}
          </div>
        ),
      },
      {
        icon: PeopleIcon,
        label: t('stakers'),
        value: isLoading ? (
          <Skeleton className="h-7 w-36" />
        ) : (
          <div className="flex-items-c gap-4">
            <span>{data ? formatNumWithCommas(data?.stakers) : '-'}</span>
            {!!data?.stakers_growth_percentage && (
              <IncreaseLabel value={data?.stakers_growth_percentage / 100} />
            )}
          </div>
        ),
      },
      {
        icon: ProvidersIcon,
        label: t('commission'),
        value: isLoading ? (
          <Skeleton className="h-7 w-36" />
        ) : (
          formatNumWithPercent(Number(data?.commission ?? 0))
        ),
      },
    ],
    [t, data, isLoading],
  )

  return (
    <StatisticalDataCards
      className="gap-page-gap lg:gap-gap grid w-full grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"
      items={StatisticalData}
    />
  )
}

export function BtcFpDetailChart({ address, intervalDays }: BtcFpDetailProps) {
  const t = useTranslations('FinalityProvider')

  const { data, isLoading } =
    clientApi.internal.finalityProvider.fetchBtcFinalityProviderDetailStatisticalChartData.useQuery(
      { address, intervalDays },
      { enabled: !!address },
    )

  const chartData = useMemo(
    () =>
      data?.map(
        ({
          timestamp,
          amount,
          stakers,
        }: BtcFinalityProviderDailyStatisticalChartData) => ({
          timestamp: Number(timestamp) * 1000,
          amount: Number(formatBTC(BigInt(amount ?? 0))),
          stakers: Number(stakers ?? 0),
        }),
      ),
    [data],
  )

  const xDomain = useMemo(
    () => [
      Math.min(
        ...(chartData?.map(
          ({
            timestamp,
          }: {
            timestamp: number
            amount: number
            stakers: number
          }) => timestamp,
        ) || []),
      ),
      Math.max(
        ...(chartData?.map(
          ({
            timestamp,
          }: {
            timestamp: number
            amount: number
            stakers: number
          }) => timestamp,
        ) || []),
      ),
    ],
    [chartData],
  )

  const renderCustomTooltip = useCallback(
    (external: any) => {
      const { active, payload, label } = external

      if (active && payload && payload.length) {
        return (
          <div className="bg-secondary text-foreground border-border-light rounded-lg border px-6 py-4 text-sm">
            <div className="text-secondary-foreground mb-4">
              {dayjs(label).format('dddd,MMMM DD,YYYY')}
            </div>
            <div className="flex-items-c mb-3 gap-16">
              <div className="w-36">{t('totalStakingValue')}:</div>
              <div className="text-primary">
                {formatNumWithCommas(payload?.[0]?.payload?.amount ?? 0)} BTC
              </div>
            </div>
            <div className="flex-items-c gap-16">
              <div className="w-36">{t('stakers')}:</div>
              <div className="text-primary">
                {formatNumWithCommas(payload?.[1]?.payload?.stakers ?? 0)}
              </div>
            </div>
          </div>
        )
      }

      return null
    },
    [t],
  )

  const renderLegend = ({ payload }: any) => {
    return (
      <div className="flex-c text-foreground-secondary pb-page-gap gap-4 text-xs">
        {payload.map((data: any, index: number) => (
          <div key={data.payload.name} className="flex-items-c gap-2">
            <span>{data.payload.name}</span>
            <div
              className={cn(
                'h-2 w-7 rounded-sm',
                !!index ? 'bg-primary' : 'bg-foreground',
              )}
            ></div>
          </div>
        ))}
      </div>
    )
  }

  return isLoading ? (
    <Skeleton className="h-[300px] w-full" />
  ) : (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid
          className="stroke-border/20"
          stroke=""
          height={0.2}
          vertical={false}
        />
        <XAxis
          type="number"
          fontSize={12}
          dataKey="timestamp"
          domain={xDomain}
          axisLine={false}
          tickLine={false}
          tickCount={5}
          tickFormatter={value =>
            !!value ? dayjs(value).format(`MMM 'DD`) : ''
          }
        />
        <YAxis
          yAxisId="amount"
          fontSize={12}
          axisLine={false}
          tickLine={false}
          tickCount={5}
          tickFormatter={value => formatNumWithCommas(value)}
        />
        <Line
          name={t('totalStakingValue')}
          yAxisId="amount"
          className="stroke-foreground"
          type="monotone"
          dataKey="amount"
          stroke=""
          dot={false}
          activeDot={{
            className: 'stroke-foreground',
          }}
        />

        <YAxis
          yAxisId="stakers"
          fontSize={12}
          axisLine={false}
          tickLine={false}
          tickFormatter={value => formatNumWithCommas(value)}
          orientation="right"
        />
        <Line
          name={t('stakers')}
          yAxisId="stakers"
          className="stroke-primary"
          type="monotone"
          dataKey="stakers"
          stroke=""
          dot={false}
          activeDot={{
            className: 'stroke-primary',
          }}
        />
        <Tooltip content={renderCustomTooltip} />
        <Legend verticalAlign="top" content={renderLegend} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function BtcFinalityProviderStakingTransactions({
  address,
  intervalDays,
  fpName,
}: BtcFpDetailProps & { fpName?: string }) {
  const [timeRange, setTimeRange] = useState<{
    startTime: number
    endTime: number
  }>()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [filter, setFilter] = useState<BtcFpStakingTransactionsInput['filter']>(
    {
      stakingStatus: undefined,
    },
  )

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<BtcFpStakingTransactionsInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.finalityProvider.fetchInfiniteBtcFpStakingTransactions.useQuery(
      {
        address,
        cursor,
        filter,
        timeRange,
      },
    )

  useEffect(() => {
    fetchFirstPage()
    setFilter(
      produce(draft => {
        draft!.stakingStatus = columnFilters?.find(
          ({ id }) => id === 'status_desc',
        )?.value as StakingTransactionStakingStatusEnum[]
      }),
    )
  }, [columnFilters, fetchFirstPage])

  useEffect(() => {
    fetchFirstPage()
    setTimeRange(
      !!intervalDays
        ? {
            startTime: dayjs().subtract(intervalDays, 'day').unix(),
            endTime: dayjs().unix(),
          }
        : undefined,
    )
  }, [fetchFirstPage, intervalDays])

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  return (
    <DataTable
      paginationProps={{
        currentPage,
        hasPreviousPage,
        hasNextPage,
        fetchFirstPage,
        fetchPreviousPage,
        fetchNextPage,
        isLoading: isFetching,
      }}
      columns={[
        ...StakingTransactionsTableColumns().slice(0, 4),
        {
          accessorKey: 'finality_providers',
          header: 'Finality Provider',
          cell: () => fpName,
        },
        ...StakingTransactionsTableColumns().slice(5),
      ]}
      data={data?.items as unknown as StakingTransactionsItem[]}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      isLoading={isFetching}
    />
  )
}
