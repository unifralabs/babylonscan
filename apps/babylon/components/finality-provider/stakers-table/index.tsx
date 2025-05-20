'use client'

import { useEffect, useMemo, useState } from 'react'

import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type {
  FinalityProviderStakersListInput,
  FinalityProviderStakersListItem,
} from '@cosmoscan/core-api'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'
import { Badge } from '@cosmoscan/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cosmoscan/ui/select'

import { clientApi } from '@/trpc/react'
import SearchBox from '../search-box'

// Define staker status filter type
type StakerStatusFilter = 'Active' | 'Inactive' | undefined

interface FinalityProviderStakersTableProps {
  address: string
}

export default function FinalityProviderStakersTable({
  address,
}: FinalityProviderStakersTableProps) {
  const t = useTranslations('FinalityProvider')
  const paginationState = useCursorPagination<FinalityProviderStakersListInput['cursor']>()
  const [statusFilter, setStatusFilter] = useState<StakerStatusFilter>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = paginationState

  // Fetch status counts for the filter badges
  const { data: stakerStatusCounts } =
    clientApi.internal.finalityProvider.fetchFinalityProviderStakersStatusCounts.useQuery(
      { address }
    )

  // Function to get count for each status filter
  const getStatusCount = (filter: StakerStatusFilter) => {
    if (!stakerStatusCounts) return 0
    return stakerStatusCounts
      .filter(count => filter === undefined || count.status === filter)
      .reduce((sum, count) => sum + count.count, 0)
  }

  // Handle status filter change
  const handleStatusFilterChange = (status: StakerStatusFilter) => {
    setStatusFilter(status)
  }

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Reset pagination when search or filter changes
  useEffect(() => {
    fetchFirstPage()
  }, [searchQuery, statusFilter, fetchFirstPage])

  // Pass search query and status filter to API
  const { data, isFetching } =
    clientApi.internal.finalityProvider.fetchInfiniteFinalityProviderStakers.useQuery(
      {
        cursor,
        address,
        search: searchQuery,
        status: statusFilter,
      }
    )

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const FinalityProviderStakersTableColumns: ColumnDef<FinalityProviderStakersListItem>[] =
    useMemo(
      () => [
        {
          accessorKey: 'babylon_address',
          header: t('address'),
          cell: ({ getValue }) => (
            <ExternalLinkRenderer
              type="address"
              content={getValue<string>()}
              short={false}
            />
          ),
        },
        {
          accessorKey: 'totalAmount',
          header: t('amount'),
          cell: ({ getValue }) => <AmountLabel amount={getValue<bigint>()} />,
          meta: { textAlign: 'right' },
        },
        {
          accessorKey: 'active',
          header: t('status'),
          cell: ({ getValue }) => {
            const isActive = getValue<boolean>()
            return (
              <Badge
                variant={isActive ? 'default' : 'destructive'}
                className={isActive ? 'bg-green-500/20' : 'bg-red-500/20'}
              >
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
        },
      ],
      [t],
    )

  // Filter and search component
  const filterComponent = (
    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-4">
      <Select
        value={statusFilter === undefined ? 'undefined' : statusFilter}
        onValueChange={(value) => {
          if (value === 'undefined') {
            handleStatusFilterChange(undefined);
          } else if (value === 'Active' || value === 'Inactive') {
            handleStatusFilterChange(value);
          }
        }}
      >
        <SelectTrigger className="h-10 w-full md:w-36">
          <SelectValue placeholder={t('filterByStatus')} />
        </SelectTrigger>
        <SelectContent align="start">
          {[
            { label: 'All', value: 'undefined' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ].map(filter => (
            <SelectItem
              key={filter.value}
              value={filter.value}
            >
              {filter.label} ({getStatusCount(filter.value === 'undefined' ? undefined : filter.value as StakerStatusFilter)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SearchBox placeholder={t('searchStaker')} onSearch={handleSearch} />
    </div>
  )

  return (
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
        hideSinglePage: true,
      }}
      filterComponent={filterComponent}
      columns={FinalityProviderStakersTableColumns}
      data={data?.items || []}
      isLoading={isFetching}
      autoEmptyCellHeight={false}
    />
  )
}
