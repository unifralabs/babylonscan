'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { clientApi } from '../../trpc/react'
import { CellContext, ColumnDef, SortingState } from '@tanstack/react-table'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { ValidatorListInput, ValidatorListItem } from '@cosmoscan/core-api'
import { generateExternalLink } from '@cosmoscan/core/components/external-link-renderer'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import useIsMobile from '@cosmoscan/shared/hooks/use-is-mobile'
import {
  ValidatorsSortTypeEnum,
  ValidatorStatusEnum,
} from '@cosmoscan/shared/types'
import {
  formatNumWithCommas,
  formatNumWithPercent,
  formatUnits,
  shortStr,
} from '@cosmoscan/shared/utils'
import { Card } from '@cosmoscan/ui/card'
import BlockieAvatar from '@cosmoscan/ui/components/blockie-avatar'
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
import { Skeleton } from '@cosmoscan/ui/skeleton'

type ValidatorStatusFilter = {
  status?: ValidatorStatusEnum
  jailed?: boolean
}

const STATUS_FILTERS: { label: string; value: ValidatorStatusFilter }[] = [
  { label: 'All', value: {} },
  {
    label: 'Bonded',
    value: { status: ValidatorStatusEnum.BOND_STATUS_BONDED, jailed: false },
  },
  {
    label: 'Inactive',
    value: { status: ValidatorStatusEnum.BOND_STATUS_UNBONDED, jailed: false },
  },
  { label: 'Jailed', value: { jailed: true } },
]

export default function Validators() {
  const t = useTranslations('Validator')
  const router = useRouter()
  const isMobile = useIsMobile()

  const [sorting, setSorting] = useState<SortingState>([
    { id: ValidatorsSortTypeEnum.VOTING_POWER, desc: true },
  ])
  const [statusFilter, setStatusFilter] = useState<ValidatorStatusFilter>({
    status: ValidatorStatusEnum.BOND_STATUS_BONDED,
    jailed: false,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<ValidatorListInput['cursor']>()

  const { data: statusCounts } =
    clientApi.internal.validator.fetchValidatorStatusCounts.useQuery()
  const { data: totalValidatorsVotingPowerAndBonded } =
    clientApi.internal.validator.fetchTotalValidatorsVotingPowerAndBonded.useQuery()
  const { data, isFetching, error } =
    clientApi.internal.validator.fetchInfiniteValidators.useQuery({
      cursor,
      sort: sorting[0]?.id as ValidatorListInput['sort'],
      desc: sorting[0]?.desc,
      ...statusFilter,
      search: debouncedSearch,
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const fetchValidatorsColumns = useCallback(
    ({
      currentPage,
      pageSize = CONSTANT.tableDefaultPageSize,
      totalVotingPower = 1,
    }: {
      currentPage: number
      pageSize?: number
      totalVotingPower?: number
    }): ColumnDef<ValidatorListItem>[] => [
      ...(isMobile
        ? []
        : [
            {
              accessorKey: 'id',
              header: '#',
              cell: ({ row }: CellContext<ValidatorListItem, unknown>) =>
                row.index + 1 + (currentPage - 1) * pageSize,
            },
          ]),
      {
        accessorKey: 'name',
        header: t('validator'),
        cell: ({ row }) => (
          <div className="flex-items-c gap-4">
            <div className="md:flex-c hidden h-10 w-10 shrink-0 rounded-full">
              {!!row.original.owner_address ? (
                <BlockieAvatar
                  className="w-h-full"
                  address={row.original.owner_address}
                  rounded
                />
              ) : (
                <Skeleton className="w-h-full rounded-full" />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div>{row.original.name || '-'}</div>
              <div>{shortStr(row.original.owner_address || '') || '-'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'voting_power',
        header: ({ column }) =>
          isMobile ? (
            t('votingPower')
          ) : (
            <ReactTableSortHeader<ValidatorListItem> column={column}>
              <QATooltip content={t('votingPowerTip')}>
                {t('votingPower')}
              </QATooltip>
            </ReactTableSortHeader>
          ),
        cell: ({ row }) => (
          <div className="flex-items-c gap-2 md:justify-end">
            <span>
              {formatUnits(BigInt(Number(row.original.voting_power ?? 0)), 6)}
            </span>
            <span className="text-foreground-secondary">
              {formatNumWithPercent(
                Number(row.original.voting_power ?? 0) /
                  (totalVotingPower ?? 1),
              )}
            </span>
          </div>
        ),
        meta: {
          textAlign: 'right',
        },
      },
      {
        accessorKey: 'cumulativeShare',
        header: () =>
          isMobile ? (
            t('cumulativeShare')
          ) : (
            <QATooltip content={t('cumulativeShareTip')}>
              {t('cumulativeShare')}
            </QATooltip>
          ),
        cell: ({ getValue }) =>
          formatNumWithPercent(Number(getValue<number>() / 100)),
        meta: {
          textAlign: 'right',
        },
      },
      {
        accessorKey: 'commission',
        header: ({ column }) =>
          isMobile ? (
            t('commission')
          ) : (
            <ReactTableSortHeader<ValidatorListItem> column={column}>
              <QATooltip content={t('commissionTip')}>
                {t('commission')}
              </QATooltip>
            </ReactTableSortHeader>
          ),
        cell: ({ getValue }) =>
          formatNumWithPercent(Number(getValue<number>())),
        meta: {
          textAlign: 'right',
        },
      },
      {
        accessorKey: 'uptime.uptime',
        header: () =>
          isMobile ? (
            t('uptime')
          ) : (
            <QATooltip
              classNames={{ root: 'md:justify-end' }}
              content={t('uptimeTip')}
            >
              {t('uptime')}
            </QATooltip>
          ),
        cell: ({ getValue }) =>
          formatNumWithPercent(Number(getValue<number>())),
        meta: {
          textAlign: 'right',
        },
      },
      {
        accessorKey: 'inclusion.rate',
        header: () =>
          isMobile ? (
            t('timestampInclusion')
          ) : (
            <QATooltip
              classNames={{ root: 'md:justify-end' }}
              content={t('timestampInclusionTip')}
            >
              {t('timestampInclusion')}
            </QATooltip>
          ),
        cell: ({ getValue }) =>
          formatNumWithPercent(Number(getValue<number>())),
        meta: {
          textAlign: 'right',
        },
      },
      {
        accessorKey: 'lastSignedEpoch',
        header: t('lastSignedEpoch'),
        cell: ({ getValue }) => formatNumWithCommas(getValue<number>()) || '-',
        meta: {
          textAlign: 'right',
        },
      },
    ],
    [t, isMobile],
  )

  const getStatusCount = (filter: ValidatorStatusFilter) => {
    if (!statusCounts) return 0
    return statusCounts
      .filter(
        count =>
          (!filter.status || count.status === filter.status) &&
          (typeof filter.jailed !== 'boolean' ||
            count.jailed === filter.jailed),
      )
      .reduce((sum, count) => sum + count.count, 0)
  }

  return (
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
                <SelectValue placeholder="Filter by status" />
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
                placeholder="Search by name or address"
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
        columns={fetchValidatorsColumns({
          currentPage,
          totalVotingPower:
            totalValidatorsVotingPowerAndBonded?.totalVotingPower,
        })}
        data={data?.items}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isFetching}
        onRowClick={row =>
          router.push(
            generateExternalLink({
              type: 'validator',
              pathParamValue: row.original.operator_address,
            }),
          )
        }
        emptyText={
          error
            ? t('searchError')
            : debouncedSearch
              ? t('noValidatorsFound')
              : undefined
        }
      />
    </Card>
  )
}
