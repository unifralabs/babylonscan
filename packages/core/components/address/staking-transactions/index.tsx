'use client'

import { useEffect, useMemo, useState } from 'react'

import { StakingTransactionsTableColumns } from '../../../pages/staking-transactions'
import { clientApi } from '../../../trpc/react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import {
  AddressStakingTransactionsInput,
  AddressStakingTransactionsItem,
} from '@cosmoscan/core-api'
import { FinalityProviderAvatarNameWrapper } from '@cosmoscan/core/components/finality-provider'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { StakingTransactionStakingStatusEnum } from '@cosmoscan/shared/types'
import { cn } from '@cosmoscan/shared/utils'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'
import DataTabs from '@cosmoscan/ui/components/underline-tabs'

export default function AddressStakingTransactions({
  address,
  mode = 'reward',
  hideSinglePage = true,
  autoEmptyCellHeight = false,
}: {
  address: string
  mode?: 'reward' | 'common'
  hideSinglePage?: boolean
  autoEmptyCellHeight?: boolean
}) {
  const t = useTranslations('Transaction')
  const [tab, setTab] = useState('all')
  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<AddressStakingTransactionsInput['cursor']>()

  const isRewardMode = useMemo(() => mode === 'reward', [mode])

  const { data, isFetching } =
    clientApi.internal.staking.fetchInfiniteStakingTransactionsByAddress.useQuery(
      {
        address,
        cursor,
        filter: {
          stakingStatus: isRewardMode
            ? tab === 'all'
              ? undefined
              : [tab as StakingTransactionStakingStatusEnum]
            : undefined,
        },
      },
      { enabled: !!address },
    )

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const AddressStakingTransactionsColumns: ColumnDef<AddressStakingTransactionsItem>[] =
    useMemo(
      () => [
        {
          accessorKey: 'finality_providers',
          header: t('finalityProvider'),
          cell: ({ getValue }) => {
            const finalityProviders =
              getValue<AddressStakingTransactionsItem['finality_providers']>()
            const finalityProvider = !!finalityProviders?.[0]?.btc_pk
              ? finalityProviders?.[0]
              : finalityProviders?.find(item => !!item?.btc_pk)

            return (
              <FinalityProviderAvatarNameWrapper
                name={finalityProvider?.name}
                address={finalityProvider?.btc_pk}
                status={finalityProvider?.status}
              />
            )
          },
        },
        {
          accessorKey: 'id',
          header: t('chain'),
          cell: 'babylon',
          meta: { textAlign: 'right' },
        },
        {
          accessorKey: 'total_sat',
          header: t('amount'),
          cell: ({ getValue }) => (
            <AmountLabel amount={BigInt(getValue<number>())} />
          ),
          meta: { textAlign: 'right' },
        },
        {
          accessorKey: 'reward',
          header: t('reward'),
          cell: ({ getValue }) => (
            <AmountLabel
              amount={BigInt(getValue<number>() ?? 0)}
              isChainNativeToken
            />
          ),
          meta: { textAlign: 'right' },
        },
      ],
      [t],
    )

  const columns = useMemo(
    () =>
      isRewardMode
        ? AddressStakingTransactionsColumns
        : [
            ...StakingTransactionsTableColumns().slice(0, 2),
            ...StakingTransactionsTableColumns().slice(3),
          ],
    [AddressStakingTransactionsColumns, isRewardMode],
  )

  return (
    <div className={cn(isRewardMode && 'pt-4')}>
      {isRewardMode && (
        <DataTabs
          activeTab={tab}
          setActiveTab={setTab}
          tabs={[
            {
              value: 'all',
              valueContent: t('delegations'),
            },
            {
              value: StakingTransactionStakingStatusEnum.UNBONDING,
              valueContent: t('unbonding'),
            },
            {
              value: StakingTransactionStakingStatusEnum.WITHDRAWN,
              valueContent: t('withdrawns'),
            },
          ]}
          variant="solid"
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
          hideSinglePage,
        }}
        columns={columns}
        data={data?.items || []}
        isLoading={isFetching}
        autoEmptyCellHeight={autoEmptyCellHeight}
      />
    </div>
  )
}
