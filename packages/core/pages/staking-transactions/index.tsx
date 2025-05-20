'use client'

import { useEffect, useState } from 'react'

import { clientApi } from '../../trpc/react'
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import { produce } from 'immer'
import { useTranslations } from 'next-intl'

import type {
  StakingTransactionsInput,
  StakingTransactionsItem,
} from '@cosmoscan/core-api'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import {
  TableAgeCell,
  TableMempoolHashCell,
} from '@cosmoscan/core/components/table-cell-renderer'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { StakingTransactionStakingStatusEnum } from '@cosmoscan/shared/types'
import { blocksToDisplayTime } from '@cosmoscan/shared/utils/btc'
import { Card } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'
import { ReactTableFilterHeader } from '@cosmoscan/ui/components/react-table-components'

export function StakingTransactionsTableColumns(): ColumnDef<StakingTransactionsItem>[] {
  const t = useTranslations('Transaction')
  const commonT = useTranslations('Common')

  return [
    {
      accessorKey: 'status_desc',
      header: ({ column }) => (
        <ReactTableFilterHeader<StakingTransactionsItem>
          classNames={{ selectItem: 'capitalize' }}
          column={column}
          selectItems={Object.values(StakingTransactionStakingStatusEnum).map(
            value => ({ label: t(value.toLowerCase()), value }),
          )}
          isMutiple
        >
          {t('status')}
        </ReactTableFilterHeader>
      ),
      cell: ({ getValue }) => (
        <span className="capitalize">
          {commonT(getValue<string>().toLowerCase())}
        </span>
      ),
    },
    {
      accessorKey: 'staking_tx_hash',
      header: t('txnHash'),
      cell: ({ getValue }) => (
        <TableMempoolHashCell type="tx" hash={getValue<string>()} isCopyable />
      ),
    },
    // {
    //   accessorKey: 'staking_block_height',
    //   header: 'Block',
    //   cell: ({ getValue }) => (
    //     <TableMempoolHashCell type="block" hash={getValue<string>()} />
    //   ),
    // },
    {
      accessorKey: 'btc_address',
      header: t('staker'),
      cell: ({ getValue }) => (
        <TableMempoolHashCell
          type="address"
          hash={getValue<string>()}
          isCopyable
        />
      ),
    },
    {
      accessorKey: 'total_sat',
      header: t('amount'),
      cell: ({ getValue }) => <AmountLabel amount={getValue<bigint>()} />,
    },
    {
      accessorKey: 'finality_providers',
      header: t('finalityProviders'),
      cell: ({ getValue }) => {
        const finalityProviders =
          getValue<StakingTransactionsItem['finality_providers']>()
        const finalityProvider = !!finalityProviders?.[0]?.btc_pk
          ? finalityProviders?.[0]
          : finalityProviders?.find(
              (
                item: NonNullable<
                  StakingTransactionsItem['finality_providers']
                >[number],
              ) => !!item?.btc_pk,
            )

        return !!finalityProviders ? (
          <div className="flex-items-c gap-2">
            <ExternalLinkRenderer
              type="finalityProvider"
              pathParamValue={finalityProvider?.btc_pk}
              content={finalityProvider?.name || '-'}
              showTooltip
            />
            {finalityProviders.length > 1 && (
              <span className="text-foreground-secondary text-sm">
                +{finalityProviders.length - 1}
              </span>
            )}
          </div>
        ) : (
          '-'
        )
      },
    },
    {
      accessorKey: 'staking_peroid',
      header: t('period'),
      cell: ({ getValue }) => blocksToDisplayTime(getValue<number>()),
    },
    {
      accessorKey: 'staking_timestamp',
      header: commonT('age'),
      cell: ({ getValue }) => <TableAgeCell time={getValue<bigint>()} />,
    },
  ]
}

export default function StakingTransactions({
  columns = StakingTransactionsTableColumns(),
}: {
  columns?: ColumnDef<StakingTransactionsItem>[]
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [filter, setFilter] = useState<StakingTransactionsInput['filter']>({
    stakingStatus: undefined,
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
  } = useCursorPagination<StakingTransactionsInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.staking.fetchInfiniteStakingTransactions.useQuery({
      cursor,
      filter,
    })

  useEffect(() => {
    fetchFirstPage()
    setFilter(
      produce(draft => {
        draft!.stakingStatus = columnFilters?.find(
          ({ id }) => id === 'status_desc',
        )?.value as StakingTransactionStakingStatusEnum[]
      }),
    )
  }, [columnFilters, fetchFirstPage])

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

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
        columns={columns}
        data={data?.items}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        isLoading={isFetching}
      />
    </Card>
  )
}
