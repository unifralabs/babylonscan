'use client'

import { useEffect, useMemo } from 'react'

import { clientApi } from '../../../trpc/react'
import ExternalLinkRenderer from '../../external-link-renderer'
import { TableAgeCell, TransactionTypesCell } from '../../table-cell-renderer'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type {
  ValidatorPowerEventsListInput,
  ValidatorPowerEventsListItem,
} from '@cosmoscan/core-api'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'

export interface PowerEventsProps {
  address: string
  ownerAddress: string
}

export default function PowerEventsTable({
  address,
  ownerAddress,
}: PowerEventsProps) {
  const t = useTranslations('Validator')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<ValidatorPowerEventsListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.validator.fetchValidatorPowerEvents.useQuery(
      { cursor, address },
      { enabled: !!address && !!ownerAddress },
    )

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const PowerEventsColumns: ColumnDef<ValidatorPowerEventsListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'tx_hash',
        header: t('txHash'),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer
            type="transaction"
            content={getValue<string>()}
          />
        ),
      },
      {
        accessorKey: 'event_type',
        header: t('type'),
        cell: ({ getValue }) => (
          <TransactionTypesCell
            types={!!getValue<string>() ? [getValue<string>()] : []}
          />
        ),
      },
      {
        accessorKey: 'height',
        header: t('height'),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer type="block" content={getValue<string>()} />
        ),
      },
      {
        accessorKey: 'amount',
        header: t('amount'),
        cell: ({ getValue, row }) => (
          <AmountLabel
            className={
              row.original.amount_type === 'spent' ? 'text-red' : 'text-green'
            }
            amount={BigInt(getValue<number>() ?? 0)}
            isChainNativeToken
          />
        ),
      },
      {
        accessorKey: 'timestamp',
        header: t('time'),
        cell: ({ getValue }) => <TableAgeCell time={getValue<bigint>()} />,
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
      columns={PowerEventsColumns}
      data={data?.items}
      isLoading={isFetching}
      autoEmptyCellHeight={false}
    />
  )
}
