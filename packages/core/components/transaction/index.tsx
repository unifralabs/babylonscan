'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { clientApi } from '../../trpc/react'
import ExternalLinkRenderer from '../external-link-renderer'
import { TableAgeCell, TransactionTypesCell } from '../table-cell-renderer'
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import { produce } from 'immer'
import { useTranslations } from 'next-intl'

import type {
  TransactionListInput,
  TransactionListItem,
} from '@cosmoscan/core-api'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import {
  CosmosBaseTransactionTypeEnum,
  TransactionStakingTypes,
  TransactionTypeEnum,
} from '@cosmoscan/shared/types'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'
import { ReactTableFilterHeader } from '@cosmoscan/ui/components/react-table-components'
import { Label } from '@cosmoscan/ui/label'
import { Switch } from '@cosmoscan/ui/switch'
import { Tooltip } from '@cosmoscan/ui/tooltip'

export interface TransactionsTableProps {
  address?: string
  block?: string | number | bigint
  isPageTable?: boolean
}

export function TransactionsTable({
  address,
  block,
  isPageTable = false,
}: TransactionsTableProps) {
  const t = useTranslations('Transaction')
  const commonT = useTranslations('Common')

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [filter, setFilter] = useState<TransactionListInput['filter']>({
    stakingType: undefined,
    height: !!block ? Number(block) : undefined,
  })

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<TransactionListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.transaction.fetchInfiniteTransactions.useQuery({
      address,
      cursor,
      filter,
    })

  const stakingTypeFilterValue = columnFilters?.find(({ id }) => id === 'type')
    ?.value as TransactionTypeEnum[]

  const heightFilterValue = columnFilters?.find(
    ({ id }) => id === 'height',
  )?.value

  const onFilter = useCallback(
    (key: keyof TransactionListInput['filter'], value: any) => {
      fetchFirstPage()
      setFilter(
        produce(draft => {
          draft![key] = value
        }),
      )
    },
    [fetchFirstPage],
  )

  useEffect(() => {
    onFilter('stakingType', stakingTypeFilterValue)
  }, [stakingTypeFilterValue, onFilter])

  useEffect(() => {
    onFilter(
      'height',
      !!heightFilterValue ? Number(heightFilterValue) : undefined,
    )
  }, [heightFilterValue, onFilter])

  useEffect(() => {
    if (!!block) {
      setColumnFilters(pre => {
        const draft = [...pre]
        !pre?.some(({ id }) => id === 'height') &&
          draft.push({ id: 'height', value: block })
        return draft
      })
    }
  }, [block])

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const stakingTypeFilterContent = useMemo(
    () =>
      CURRENT_CHAIN.isBabylon ? (
        <div className="flex items-center space-x-2">
          <Switch
            id="staking-filter"
            checked={
              JSON.stringify([...(stakingTypeFilterValue || [])].sort()) ===
              JSON.stringify([...TransactionStakingTypes].sort())
            }
            onCheckedChange={checked => {
              setColumnFilters(pre => {
                const draft = [...pre]
                const value = checked ? TransactionStakingTypes : []
                const index = pre?.findIndex(({ id }) => id === 'type')
                if (index > -1) draft.splice(index, 1)
                draft.push({ id: 'type', value })
                return draft
              })
            }}
            disabled={isFetching}
          />
          <Label htmlFor="staking-filter" className="whitespace-nowrap">
            {t('btcStakingFilterTip')}
          </Label>
        </div>
      ) : undefined,
    [t, isFetching, stakingTypeFilterValue],
  )

  const TransactionsColumns: ColumnDef<TransactionListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: t('status'),
        size: 120,
        cell: ({ row }) => (
          <span
            className={row.original.status === 0 ? 'text-green' : 'text-red'}
          >
            {0 === Number(row.original.status) ? (
              'Success'
            ) : !!row.original.error_message ? (
              <Tooltip content={JSON.stringify(row.original.error_message)}>
                <span>{commonT('failed')}</span>
              </Tooltip>
            ) : (
              commonT('failed')
            )}
          </span>
        ),
      },
      {
        accessorKey: 'hash',
        header: t('txnHash'),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer
            type="transaction"
            content={getValue<string>()}
            isCopyable
          />
        ),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <ReactTableFilterHeader<TransactionListItem>
            column={column}
            selectItems={Object.values(
              CURRENT_CHAIN.isBabylon
                ? TransactionTypeEnum
                : CosmosBaseTransactionTypeEnum,
            ).map(value => ({
              label: value,
              value,
            }))}
            isMutiple
          >
            {t('type')}
          </ReactTableFilterHeader>
        ),
        cell: ({ row }) => (
          <TransactionTypesCell types={row.original.message_types} />
        ),
      },
      {
        accessorKey: 'height',
        header: ({ column }) => (
          <ReactTableFilterHeader<TransactionListItem>
            type="input"
            column={column}
            inputProps={{
              placeholder: 'Input block height',
              validator: value => /^[0-9]+$/.test(value),
            }}
            isMutiple
          >
            {t('block')}
          </ReactTableFilterHeader>
        ),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer type="block" content={getValue<bigint>()} />
        ),
      },
      {
        accessorKey: 'amount',
        header: t('amount'),
        cell: ({ getValue }) => (
          <AmountLabel
            amount={BigInt(getValue<number>() ?? 0)}
            isChainNativeToken
          />
        ),
      },
      {
        accessorKey: 'tx_fee',
        header: t('txnFee'),
        cell: ({ getValue }) => (
          <AmountLabel amount={BigInt(getValue<number>())} isChainNativeToken />
        ),
      },
      {
        accessorKey: 'timestamp',
        header: commonT('age'),
        cell: ({ getValue }) => <TableAgeCell time={getValue<bigint>()} />,
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
        content: stakingTypeFilterContent,
        hideSinglePage: false,
      }}
      columns={TransactionsColumns}
      data={data?.items}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      isLoading={isFetching}
      autoEmptyCellHeight={isPageTable}
      emptyText={commonT('noData')}
    />
  )
}
