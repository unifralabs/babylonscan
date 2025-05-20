'use client'

import { useEffect, useMemo, useState } from 'react'

import { clientApi } from '../../../trpc/react'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type { ContractsListInput, ContractsListItem } from '@cosmoscan/core-api'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { TableAgeCell } from '@cosmoscan/core/components/table-cell-renderer'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import {
  ContractsListSortTypeEnum,
  ContractsListTypeDict,
  ContractsListTypeEnum,
} from '@cosmoscan/shared/types'
import DataTable from '@cosmoscan/ui/components/data-table'
import PageLinkTabs from '@cosmoscan/ui/components/page-link-tabs'

export interface ContractsListProps {
  type?: ContractsListTypeEnum
  withTabs?: boolean
}

export default function ContractsListTable({
  type = ContractsListTypeEnum.ALL,
  withTabs = false,
}: ContractsListProps) {
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
  } = useCursorPagination<ContractsListInput['cursor']>()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: ContractsListSortTypeEnum.CREATION_TIMESTAMP,
      desc: true,
    },
  ])

  const { data, isFetching } =
    clientApi.internal.contract.fetchInfiniteContracts.useQuery({
      type,
      cursor,
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  useEffect(() => {
    fetchFirstPage()
  }, [fetchFirstPage, type])

  const ContractsListColumns: ColumnDef<ContractsListItem>[] = useMemo(
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
    <>
      {withTabs && (
        <PageLinkTabs
          queryKey="type"
          activeTab={type}
          tabs={Object.values(ContractsListTypeEnum).map(value => ({
            value,
            valueContent: t(ContractsListTypeDict[value]),
          }))}
        />
      )}

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
        columns={ContractsListColumns}
        data={data?.items}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isFetching}
      />
    </>
  )
}
