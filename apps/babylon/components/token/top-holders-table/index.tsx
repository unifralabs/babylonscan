'use client'

import { useEffect } from 'react'

import { ColumnDef } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'
import { useTranslations } from 'next-intl'

import type {
  TokenHoldersListInput,
  TokenHoldersListItem,
} from '@cosmoscan/core-api'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'

import { clientApi } from '@/trpc/react'

export function fetchTokenTopHoldersTableColumns(
  t: ReturnType<typeof useTranslations>,
  currency: string,
  totalSupply: string,
  currentPage: number,
  decimals: number,
  pageSize: number = CONSTANT.tableDefaultPageSize,
): ColumnDef<TokenHoldersListItem>[] {
  return [
    {
      accessorKey: 'id',
      header: t('rank'),
      cell: ({ row }) => row.index + 1 + (currentPage - 1) * pageSize,
    },
    {
      accessorKey: 'address',
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
      accessorKey: 'balance',
      header: t('balance'),
      cell: ({ getValue }) => (
        <AmountLabel
          amount={getValue<bigint>()}
          currency={currency}
          decimals={decimals}
        />
      ),
      meta: { textAlign: 'left' },
    },
    {
      accessorKey: 'percentage',
      header: t('percentage'),
      cell: ({ row }) => (
        <span>
          {BigNumber(Number(row.original.balance ?? 0))
            .div(totalSupply)
            .multipliedBy(100)
            .toFixed(18)}{' '}
          %
        </span>
      ),
      meta: { textAlign: 'left' },
    },
  ]
}

export interface TokenTopHoldersTableProps {
  denom: string
  totalSupply: string
  currency: string
  decimals: number
}

export default function TokenTopHoldersTable({
  denom,
  totalSupply,
  currency,
  decimals,
}: TokenTopHoldersTableProps) {
  const t = useTranslations('Token')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<TokenHoldersListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.token.fetchTokenTopHolders.useQuery({ cursor, denom })

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
        hideSinglePage: true,
      }}
      columns={fetchTokenTopHoldersTableColumns(
        t,
        currency,
        totalSupply,
        currentPage,
        decimals,
      )}
      data={data?.items}
      isLoading={isFetching}
      autoEmptyCellHeight={false}
    />
  )
}
