'use client'

import { useEffect, useMemo } from 'react'

import { clientApi } from '../../../trpc/react'
import ExternalLinkRenderer from '../../external-link-renderer'
import { TableAgeCell } from '../../table-cell-renderer'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type {
  ValidatorProposedBlocksListInput,
  ValidatorProposedBlocksListItem,
} from '@cosmoscan/core-api'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import DataTable from '@cosmoscan/ui/components/data-table'

export interface ValidatorProposedBlocksProps {
  address: string
}

export default function ValidatorProposedBlocksTable({
  address,
}: ValidatorProposedBlocksProps) {
  const t = useTranslations('Block')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<ValidatorProposedBlocksListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.validator.fetchValidatorProposedBlocks.useQuery({
      cursor,
      address,
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const ValidatorProposedBlocksTableColumns: ColumnDef<ValidatorProposedBlocksListItem>[] =
    useMemo(
      () => [
        {
          accessorKey: 'height',
          header: t('block'),
          cell: ({ row }) => {
            // Ensure height is a string
            const height = row.original.height.toString()
            return (
              <ExternalLinkRenderer
                type="block"
                content={height}
                pathParamValue={height}
              />
            )
          },
        },
        {
          accessorKey: 'hash',
          header: t('hash'),
          cell: ({ row }) => (
            <div className="max-w-[200px] truncate">{row.original.hash}</div>
          ),
        },
        {
          accessorKey: 'num_txs',
          header: t('transactions'),
          cell: ({ row }) => row.original.num_txs,
          meta: {
            textAlign: 'right',
          },
        },
        {
          accessorKey: 'timestamp',
          header: t('time'),
          cell: ({ getValue }) => <TableAgeCell time={getValue<number>()} className="ml-auto" />,
          meta: {
            textAlign: 'right',
          },
        },
      ],
      [t],
    )

  return (
    <DataTable
      columns={ValidatorProposedBlocksTableColumns}
      data={data?.items}
      paginationProps={{
        currentPage,
        hasPreviousPage,
        hasNextPage,
        fetchFirstPage,
        fetchPreviousPage,
        fetchNextPage,
        isLoading: isFetching,
      }}
      isLoading={isFetching}
    />
  )
}