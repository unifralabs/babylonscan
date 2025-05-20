'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CellContext, ColumnDef, SortingState } from '@tanstack/react-table'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type {
  FinalityProviderListInput,
  FinalityProviderListItem,
} from '@cosmoscan/core-api'
import { generateExternalLink } from '@cosmoscan/core/components/external-link-renderer'
import { FinalityProviderAvatarNameWrapper } from '@cosmoscan/core/components/finality-provider'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import useIsMobile from '@cosmoscan/shared/hooks/use-is-mobile'
import { FinalityProvidersSortTypeEnum } from '@cosmoscan/shared/types'
import { Card } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'
import QATooltip from '@cosmoscan/ui/components/qa-tooltip'
import { ReactTableSortHeader } from '@cosmoscan/ui/components/react-table-components'
import { Input } from '@cosmoscan/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cosmoscan/ui/select'

import { clientApi } from '@/trpc/react'

// Define the filter type for finality provider status
type FinalityProviderStatusFilter = {
  status?: 'Active' | 'Standby' | 'Jailed'
}

// Define filter options
const STATUS_FILTERS: { label: string; value: FinalityProviderStatusFilter }[] =
  [
    { label: 'All', value: {} },
    { label: 'Active', value: { status: 'Active' } },
    { label: 'Standby', value: { status: 'Standby' } },
    { label: 'Jailed', value: { status: 'Jailed' } },
  ]

// Define custom formatter functions for the finality provider page
function formatBtcForDisplay(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0.00';
  return amount.toFixed(2);
}

// Format numbers with commas
function formatNumberWithCommas(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}

export default function FinalityProviders() {
  const t = useTranslations('FinalityProvider')
  const isMobile = useIsMobile()
  const router = useRouter()

  // Original finality providers list implementation
  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<FinalityProviderListInput['cursor']>()
  const [sorting, setSorting] = useState<SortingState>([
    { id: FinalityProvidersSortTypeEnum.TOTAL_DELEGATIONS, desc: true },
  ])
  const [statusFilter, setStatusFilter] =
    useState<FinalityProviderStatusFilter>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: statusCounts } =
    clientApi.internal.finalityProvider.fetchFinalityProviderStatusCounts.useQuery()

  const { data: totalVotingPowerAndBonded } =
    clientApi.internal.finalityProvider.fetchTotalFinalityProvidersVotingPowerAndBonded.useQuery()

  const { data, isFetching } =
    clientApi.internal.finalityProvider.fetchInfiniteFinalityProviders.useQuery(
      {
        cursor,
        sort: sorting[0]?.id as FinalityProviderListInput['sort'],
        desc: sorting[0]?.desc,
        ...statusFilter,
        search: debouncedSearch,
      },
    )

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  // Calculate total delegation across all providers for percentage calculation
  const totalDelegationAcrossAllProviders = useMemo(() => {
    if (!data?.items) return BigInt(0)
    return data.items.reduce(
      (sum: bigint, provider: FinalityProviderListItem) => sum + BigInt(Number(provider.total_sat) || 0),
      BigInt(0)
    )
  }, [data?.items])

  // Function to get count for each status filter
  const getStatusCount = (filter: FinalityProviderStatusFilter) => {
    if (!statusCounts) return 0
    return statusCounts
      .filter(count => !filter.status || count.status === filter.status)
      .reduce((sum, count) => sum + count.count, 0)
  }

  const fetchFinalityProvidersColumns = useMemo(
    () =>
      (
        currentPage: number,
        pageSize: number = CONSTANT.tableDefaultPageSize,
      ): ColumnDef<FinalityProviderListItem>[] => [
        ...(isMobile
          ? []
          : [
              {
                accessorKey: 'id',
                header: '#',
                cell: ({
                  row,
                }: CellContext<FinalityProviderListItem, unknown>) =>
                  row.index + 1 + (currentPage - 1) * pageSize,
              },
            ]),
        {
          accessorKey: 'name',
          header: t('finalityProvider'),
          cell: ({ row }) => {
            // Try to extract name from description if name is not available
            let displayName = row.original.name;
            if (!displayName && row.original.description && typeof row.original.description === 'object') {
              displayName = (row.original.description as any).moniker || '';
            }
            // Return both the wrapper component and a direct display of the name for debugging
            return (
              <div className="flex flex-col gap-2">
                <FinalityProviderAvatarNameWrapper
                  name={displayName}
                  address={row.original.btc_pk}
                  status={row.original.status}
                  showLogo={!isMobile}
                />
              </div>
            )
          },
          meta: { isMobileFullRow: true },
        },
        {
          accessorKey: 'total_sat',
          header: ({ column }) =>
            isMobile ? (
              t('totalDelegation')
            ) : (
              <ReactTableSortHeader<FinalityProviderListItem> column={column}>
                <QATooltip content={t('totalDelegationTip')}>
                  {t('totalDelegation')}
                </QATooltip>
              </ReactTableSortHeader>
            ),
          cell: ({ getValue, row }) => {
            const amount = BigInt(getValue<number>())
            const votingPower = Number(row.original.voting_power || 0);
            const totalVotingPower = Number(totalVotingPowerAndBonded?.totalVotingPower || 0);
            const percentage = totalVotingPower > 0
              ? (votingPower / totalVotingPower * 100)
              : 0;
            
            return (
              <div className="flex flex-col items-end">
                <AmountLabel amount={amount} />
                <span className="text-xs text-muted-foreground">
                  {percentage.toFixed(2)}%
                </span>
              </div>
            )
          },
          meta: { textAlign: 'right' },
        },
        {
          accessorKey: 'delegations',
          header: ({ column }) =>
            isMobile ? (
              t('delegations')
            ) : (
              <ReactTableSortHeader<FinalityProviderListItem> column={column}>
                <QATooltip content={t('delegationsTip')}>
                  {t('delegations')}
                </QATooltip>
              </ReactTableSortHeader>
            ),
          cell: ({ row }) => {
            // Use stakers as a fallback if delegations is not available
            const delegationsCount = row.original.delegations ?? row.original.stakers ?? 0
            // Convert to string if it's not already a string
            const result = typeof delegationsCount === 'string' ? delegationsCount : delegationsCount.toString()
            return result
          },
          meta: { textAlign: 'right' },
          sortingFn: 'basic',
          sortUndefined: -1,
        },
        {
          accessorKey: 'stakers',
          header: ({ column }) =>
            isMobile ? (
              t('stakers')
            ) : (
              <ReactTableSortHeader<FinalityProviderListItem> column={column}>
                <QATooltip content={t('stakersTip')}>{t('stakers')}</QATooltip>
              </ReactTableSortHeader>
            ),
          meta: { textAlign: 'right' },
        },
      ],
    [t, isMobile, totalDelegationAcrossAllProviders, totalVotingPowerAndBonded],
  )

  return (
    <>
      {/* Original Finality Providers list */}
      <Card className="p-gap w-full">
        <DataTable
          classNames={{
            root: 'flex flex-col gap-4',
            tableRoot: 'flex flex-col gap-4',
          }}
          paginationProps={{
            currentPage,
            hasPreviousPage,
            hasNextPage,
            fetchFirstPage,
            fetchPreviousPage,
            fetchNextPage,
            isLoading: isFetching,
            classNames: {
              root: 'flex items-center justify-end',
            },
          }}
          filterComponent={
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-4">
              <Select
                value={JSON.stringify(statusFilter)}
                onValueChange={value => setStatusFilter(JSON.parse(value))}
              >
                <SelectTrigger className="h-10 w-full md:w-36">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent align="start">
                  {STATUS_FILTERS.map(filter => (
                    <SelectItem
                      key={JSON.stringify(filter.value)}
                      value={JSON.stringify(filter.value)}
                    >
                      {filter.label} ({getStatusCount(filter.value)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex items-center">
                <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
                <Input
                  placeholder={t('searchByNameOrAddress')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-10 w-full pl-9 pr-9 md:w-[300px]"
                />
                {searchQuery && (
                  <X
                    className="text-muted-foreground absolute right-3 h-4 w-4 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>
            </div>
          }
          columns={fetchFinalityProvidersColumns(currentPage)}
          data={data?.items}
          sorting={sorting}
          setSorting={setSorting}
          isLoading={isFetching}
          onRowClick={row =>
            router.push(
              generateExternalLink({
                type: 'finalityProvider',
                pathParamValue: row.original.btc_pk,
              }),
            )
          }
        />
      </Card>
    </>
  )
}
