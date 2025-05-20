'use client'

import { useEffect, useMemo } from 'react'

import { clientApi } from '../../trpc/react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type {
  UtilConsumerChainsInput,
  UtilConsumerChainsItem,
} from '@cosmoscan/core-api'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { Card } from '@cosmoscan/ui/card'
import DataTable from '@cosmoscan/ui/components/data-table'

export default function ConsumerChains() {
  const t = useTranslations('ConsumerChains')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<UtilConsumerChainsInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.util.fetchInfiniteConsumerChains.useQuery({
      cursor,
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const ConsumerChainsColumns: ColumnDef<UtilConsumerChainsItem>[] = useMemo(
    () => [
      {
        accessorKey: 'chain_id',
        header: t('chainId'),
        meta: { isMobileFullRow: true },
      },
      {
        accessorKey: 'chain_name',
        header: t('chainName'),
        meta: { isMobileFullRow: true },
      },
      {
        accessorKey: 'chain_description',
        header: t('description'),
        meta: { isMobileFullRow: true },
      },
    ],
    [t],
  )

  return (
    <Card className="p-gap w-full">
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
        columns={ConsumerChainsColumns}
        data={data?.items}
        isLoading={isFetching}
      />
    </Card>
  )
}
