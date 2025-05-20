'use client'

import { useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { clientApi } from '../../trpc/react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type { ProposalListInput, ProposalListItem } from '@cosmoscan/core-api'
import {
  TransactionTypesCell,
  VoteStatusCell,
} from '@cosmoscan/core/components/table-cell-renderer'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { VoteStatusEnum } from '@cosmoscan/shared/types'
import { Card } from '@cosmoscan/ui/card'
import DataTable from '@cosmoscan/ui/components/data-table'
import { Tooltip } from '@cosmoscan/ui/tooltip'

export default function Proposals() {
  const t = useTranslations('Proposal')
  const router = useRouter()
  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<ProposalListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.proposal.fetchInfiniteProposals.useQuery({
      cursor,
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const ProposalsTableColumns: ColumnDef<ProposalListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'proposal_id',
        header: t('id'),
        cell: ({ getValue }) => `#${getValue<number>()}`,
      },
      {
        accessorKey: 'title',
        header: t('title'),
        cell: ({ getValue }) => (
          <Tooltip content={getValue<string>() || '-'}>
            <div className="max-w-[650px] truncate">
              {getValue<string>() || '-'}
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: 'message_type',
        header: t('type'),
        cell: ({ getValue, row }) => (
          <TransactionTypesCell
            types={
              row.original.message_types ||
              (!!getValue<string>() ? [getValue<string>()] : [])
            }
          />
        ),
      },
      {
        accessorKey: 'expedited',
        header: t('expedited'),
        cell: ({ getValue }) => {
          const value = getValue<boolean>()
          return value !== undefined ? (value ? t('yes') : t('no')) : '-'
        },
      },
      {
        accessorKey: 'vote_status',
        header: t('status'),
        cell: ({ getValue }) => (
          <VoteStatusCell status={getValue<VoteStatusEnum>()} />
        ),
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
        columns={ProposalsTableColumns}
        data={data?.items}
        isLoading={isFetching}
        onRowClick={row => router.push(`/proposal/${row.original.proposal_id}`)}
      />
    </Card>
  )
}
