'use client'

import { useEffect, useMemo } from 'react'

import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type {
  CodeContractsListInput,
  CodeContractsListItem,
} from '@cosmoscan/core-api'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { TableAgeCell } from '@cosmoscan/core/components/table-cell-renderer'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import DataTable from '@cosmoscan/ui/components/data-table'

import { clientApi } from '@/trpc/react'

export interface CodeContractsTableProps {
  code_id: string
}

export default function CodeContractsTable({
  code_id,
}: CodeContractsTableProps) {
  const t = useTranslations('Contract')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<CodeContractsListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.code.fetchInfiniteCodeContracts.useQuery({
      cursor,
      code_id: Number(code_id),
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const CodeContractsTableColumns: ColumnDef<CodeContractsListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'address',
        header: t('address'),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer
            type="contract"
            content={getValue<string>()}
            short={true}
          />
        ),
      },
      {
        accessorKey: 'label',
        header: t('label'),
        cell: ({ getValue }) => getValue<string>(),
      },
      {
        accessorKey: 'creator',
        header: t('creator'),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer
            type="address"
            content={getValue<string>()}
            short={true}
          />
        ),
      },
      {
        accessorKey: 'creation_timestamp',
        header: t('creationAge'),
        cell: ({ getValue }) => <TableAgeCell time={getValue<bigint>()} />,
      },
      {
        accessorKey: 'code_id',
        header: t('codeId'),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer type="code" content={getValue<bigint>()} />
        ),
      },
      {
        accessorKey: 'creation_height',
        header: t('initialBlock'),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer type="block" content={getValue<bigint>()} />
        ),
      },
    ],
    [t],
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
      columns={CodeContractsTableColumns}
      data={data?.items}
      isLoading={isFetching}
      autoEmptyCellHeight={false}
    />
  )
}
