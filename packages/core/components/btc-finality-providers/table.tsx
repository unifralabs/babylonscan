'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { clientApi } from '../../trpc/react'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Line, LineChart, ResponsiveContainer } from 'recharts'

import type {
  BtcFinalityProviderListInput,
  BtcFinalityProviderListItem,
} from '@cosmoscan/core-api'
import {
  generateExternalLink,
  type ExternalLinkRendererProps,
} from '@cosmoscan/core/components/external-link-renderer'
import { FinalityProviderAvatarNameWrapper } from '@cosmoscan/core/components/finality-provider'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import useIsMobile from '@cosmoscan/shared/hooks/use-is-mobile'
import { FinalityProvidersSortTypeEnum } from '@cosmoscan/shared/types'
import {
  formatNumWithCommas,
  formatNumWithPercent,
  shortStr,
} from '@cosmoscan/shared/utils'
import { Card } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import CopyWrapper from '@cosmoscan/ui/components/copy-wrapper'
import DataTable from '@cosmoscan/ui/components/data-table'
import IncreaseLabel from '@cosmoscan/ui/components/increase-label'
import QATooltip from '@cosmoscan/ui/components/qa-tooltip'
import { ReactTableSortHeader } from '@cosmoscan/ui/components/react-table-components'
import { Input } from '@cosmoscan/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@cosmoscan/ui/select'

export const BtcFpTimeRangeOptions = [
  { label: 'all', value: 'all' },
  { label: '24h', value: '1' },
  { label: '7d', value: '7' },
  { label: '30d', value: '30' },
  { label: '90d', value: '90' },
  { label: '1y', value: '365' },
]

export default function BtcFinalityProvidersTable({
  detailRouteType = 'finalityProvider',
}: {
  detailRouteType?: ExternalLinkRendererProps['type']
}) {
  const t = useTranslations('FinalityProvider')
  const commonT = useTranslations('Common')
  const isMobile = useIsMobile()
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [fpSearchName, setFpSearchName] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<BtcFinalityProviderListInput['cursor']>()
  const [sorting, setSorting] = useState<SortingState>([
    { id: FinalityProvidersSortTypeEnum.TOTAL_DELEGATIONS, desc: true },
  ])

  const { data, isFetching } =
    clientApi.internal.finalityProvider.fetchBtcInfiniteFinalityProviders.useQuery(
      {
        name: fpSearchName,
        intervalDays: 'all' !== timeFilter ? Number(timeFilter) : undefined,
        cursor,
        desc: sorting[0]?.desc,
      },
    )

  useEffect(() => {
    fetchFirstPage()
  }, [fetchFirstPage, timeFilter])

  const onSearch = useCallback(() => {
    if (isFetching) return
    setFpSearchName(searchText)
    fetchFirstPage()
  }, [fetchFirstPage, isFetching, searchText])

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const btcFinalityProvidersColumns: ColumnDef<BtcFinalityProviderListItem>[] =
    useMemo(
      () => [
        {
          accessorKey: 'name',
          header: t('finalityProvider'),
          cell: ({ row }) => (
            <FinalityProviderAvatarNameWrapper
              name={row.original.name}
              address={row.original.btc_pk}
              status={row.original.status}
              showLogo={!isMobile}
            />
          ),
        },
        {
          accessorKey: 'btc_pk',
          header: t('btcPk'),
          cell: ({ getValue }) => (
            <CopyWrapper
              classNames={{ root: 'md:justify-end' }}
              copyText={getValue<string>()}
            >
              {shortStr(getValue<string>())}
            </CopyWrapper>
          ),
          meta: { textAlign: 'right' },
        },
        {
          accessorKey: 'total_sat',
          header: ({ column }) =>
            isMobile ? (
              t('totalDelegation')
            ) : (
              <ReactTableSortHeader<BtcFinalityProviderListItem>
                column={column}
              >
                <QATooltip content={t('totalDelegationTip')}>
                  {t('totalDelegation')}
                </QATooltip>
              </ReactTableSortHeader>
            ),
          cell: ({ row, getValue }) => (
            <div className="flex-items-c gap-2 md:justify-end">
              <AmountLabel amount={BigInt(getValue<number>() ?? 0)} />
              {!!row.original.total_sat_growth_percentage && (
                <IncreaseLabel
                  value={row.original.total_sat_growth_percentage / 100}
                  showIcon={false}
                />
              )}
            </div>
          ),
          meta: { textAlign: 'right' },
        },
        {
          accessorKey: 'stakers',
          header: () =>
            isMobile ? (
              t('stakers')
            ) : (
              <div className="flex md:justify-end">
                <QATooltip content={t('stakersTip')}>{t('stakers')}</QATooltip>
              </div>
            ),
          cell: ({ row, getValue }) => (
            <div className="flex-items-c gap-2 md:justify-end">
              <span>
                {formatNumWithCommas(Number(getValue<number>() ?? 0))}
              </span>
              {!!row.original.stakers_growth_percentage && (
                <IncreaseLabel
                  value={row.original.stakers_growth_percentage / 100}
                  showIcon={false}
                />
              )}
            </div>
          ),
          meta: { textAlign: 'right' },
        },
        {
          accessorKey: 'commission',
          header: () =>
            isMobile ? (
              'Commission'
            ) : (
              <div className="flex md:justify-end">
                <QATooltip content={t('commissionTip')}>
                  {t('commission')}
                </QATooltip>
              </div>
            ),
          cell: ({ getValue }) =>
            formatNumWithPercent(Number(getValue<number>() ?? 0)),
          meta: { textAlign: 'right' },
        },
        {
          header: t('change'),
          cell: ({ row }) => (
            <div className="flex md:justify-end">
              <ChangeChart
                className="h-[50px] w-full md:w-[150px]"
                lineClassName={
                  (row.original.total_sat_growth_percentage ?? 0 < 0)
                    ? 'stroke-red'
                    : 'stroke-green'
                }
                data={row.original.daily_data}
                dataKey="amount"
              />
            </div>
          ),
          meta: { textAlign: 'right', isMobileFullRow: true },
        },
      ],
      [t, isMobile],
    )

  return (
    <Card className="p-gap gap-gap flex w-full flex-col">
      <div className="flex-items-c gap-4">
        <div className="flex-items-c bg-secondary flex-1 gap-2 rounded-lg px-4 py-2">
          <Search className="text-foreground-secondary h-4 w-4 shrink-0" />
          <Input
            className="h-8 flex-1 border-none p-0"
            placeholder={t('searchFp')}
            value={searchText}
            onChange={({ target }) => setSearchText(target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            disabled={isFetching}
          />
        </div>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="bg-secondary h-12 max-w-32 rounded-lg border-none">
            {!!BtcFpTimeRangeOptions?.find(({ value }) => value === timeFilter)
              ?.label
              ? commonT(
                  BtcFpTimeRangeOptions?.find(
                    ({ value }) => value === timeFilter,
                  )?.label,
                )
              : '-'}
          </SelectTrigger>
          <SelectContent>
            {BtcFpTimeRangeOptions?.map(({ label, value }) => (
              <SelectItem key={label} value={value}>
                {commonT(label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        columns={btcFinalityProvidersColumns}
        data={data?.items ?? []}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isFetching}
        onRowClick={row =>
          router.push(
            generateExternalLink({
              type: detailRouteType,
              pathParamValue: row.original.btc_pk,
            }),
          )
        }
      />
    </Card>
  )
}

export function ChangeChart({
  className,
  lineClassName,
  data,
  dataKey,
}: {
  className?: string
  lineClassName?: string
  data?: any[]
  dataKey: string
}) {
  const isMobile = useIsMobile()

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            className={lineClassName}
            type="monotone"
            dataKey={dataKey}
            stroke=""
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
