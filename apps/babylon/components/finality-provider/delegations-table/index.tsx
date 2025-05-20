'use client'

import { useEffect, useMemo } from 'react'

import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type {
  FinalityProviderStakersListInput,
  FinalityProviderStakersListItem,
} from '@cosmoscan/core-api'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import {
  TableAgeCell,
  TableMempoolHashCell,
} from '@cosmoscan/core/components/table-cell-renderer'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { shortStr } from '@cosmoscan/shared/utils'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import CopyIcon from '@cosmoscan/ui/components/copy-icon'
import DataTable from '@cosmoscan/ui/components/data-table'
import { Tooltip } from '@cosmoscan/ui/tooltip'

import { clientApi } from '@/trpc/react'

export interface FinalityProviderStakersTableProps {
  address: string
}

export default function FinalityProviderDelegationsTable({
  address,
}: FinalityProviderStakersTableProps) {
  const t = useTranslations('FinalityProvider')
  const commonT = useTranslations('Common')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<FinalityProviderStakersListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.finalityProvider.fetchInfiniteFinalityProviderDelegations.useQuery(
      { cursor, address },
    )

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const FinalityProviderStakersTableColumns: ColumnDef<FinalityProviderStakersListItem>[] =
    useMemo(
      () => [
        {
          accessorKey: 'staking_tx_hash',
          header: t('txHash'),
          cell: ({ getValue }) => (
            <TableMempoolHashCell
              type="tx"
              hash={getValue<string>()}
              isCopyable
            />
          ),
        },
        {
          accessorKey: 'staking_block_height',
          header: t('block'),
          cell: ({ getValue }) => (
            <TableMempoolHashCell type="block" hash={getValue<string>()} />
          ),
        },
        {
          accessorKey: 'staking_timestamp',
          header: commonT('age'),
          cell: ({ getValue }) => <TableAgeCell time={getValue<bigint>()} />,
        },
        {
          accessorKey: 'babylon_address',
          header: t('staker'),
          cell: ({ getValue }) => (
            <ExternalLinkRenderer
              type="address"
              content={getValue<string>()}
              short={true}
              isCopyable
            />
          ),
        },
        {
          accessorKey: 'btc_pk',
          header: t('btcPk'),
          cell: ({ getValue }) => {
            const value = getValue<string>()
            if (!value) return '-'

            const displayValue = shortStr(value)

            return (
              <div className="flex-items-c gap-2">
                <Tooltip content={value}>
                  <span>{displayValue}</span>
                </Tooltip>
                <CopyIcon text={value} />
              </div>
            )
          },
        },
        {
          accessorKey: 'totalAmount',
          header: t('amount'),
          cell: ({ getValue }) => <AmountLabel amount={getValue<bigint>()} />,
          meta: { textAlign: 'right' },
        },
      ],
      [t, commonT],
    )

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
      columns={FinalityProviderStakersTableColumns}
      data={data?.items}
      isLoading={isFetching}
      autoEmptyCellHeight={false}
    />
  )
}
