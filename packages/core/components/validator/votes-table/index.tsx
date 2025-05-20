'use client'

import { useEffect, useMemo } from 'react'

import ProposalDetailDialog from '../../../dialogs/proposal-detail-dialog'
import { useProposalDetailDialog } from '../../../hooks/common/use-dialog'
import { clientApi } from '../../../trpc/react'
import ExternalLinkRenderer from '../../external-link-renderer'
import {
  TransactionTypesCell,
  VoteCell,
  VoteStatusCell,
} from '../../table-cell-renderer'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type {
  ValidatorVotesListInput,
  ValidatorVotesListItem,
} from '@cosmoscan/core-api'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { VoteEnum, VoteStatusEnum } from '@cosmoscan/shared/types'
import DataTable from '@cosmoscan/ui/components/data-table'
import { Tooltip } from '@cosmoscan/ui/tooltip'

export interface VotesProps {
  address: string
}

export default function VotesTable({ address }: VotesProps) {
  const t = useTranslations('Validator')
  const { onOpen } = useProposalDetailDialog()

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<ValidatorVotesListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.validator.fetchValidatorVotes.useQuery(
      {
        cursor,
        address,
      },
      { enabled: !!address },
    )

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const VotesTableColumns: ColumnDef<ValidatorVotesListItem>[] = useMemo(
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
            <div className="max-w-[200px] truncate">
              {getValue<string>() || '-'}
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: 'message_type',
        header: t('type'),
        cell: ({ getValue }) => (
          <TransactionTypesCell
            types={!!getValue<string>() ? [getValue<string>()] : []}
          />
        ),
      },
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
        accessorKey: 'vote',
        header: t('vote'),
        cell: ({ getValue }) => <VoteCell vote={getValue<VoteEnum>()} />,
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
    <>
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
        columns={VotesTableColumns}
        data={data?.items}
        isLoading={isFetching}
        autoEmptyCellHeight={false}
        onRowClick={row =>
          onOpen({ props: { proposalId: row.original.proposal_id } })
        }
      />
      <ProposalDetailDialog />
    </>
  )
}
