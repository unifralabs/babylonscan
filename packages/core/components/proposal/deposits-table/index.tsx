'use client'

import { useMemo } from 'react'

import { clientApi } from '../../../trpc/react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { formatUTCTime } from '@cosmoscan/shared/utils'
import { Card } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'

export type ProposalDepositsProps = {
  proposalId: number
}

export default function ProposalDepositsTable({
  proposalId,
}: ProposalDepositsProps) {
  const t = useTranslations('Proposal')
  const { data, isLoading } =
    clientApi.internal.proposal.fetchProposalDeposits.useQuery(proposalId, {
      enabled: !!proposalId,
    })

  const DepositsTableColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'depositor',
        header: t('depositor'),
        cell: ({ row }) => (
          <ExternalLinkRenderer
            type="address"
            content={row.original.depositor}
            showTooltip={true}
          />
        ),
      },
      {
        accessorKey: 'amount',
        header: t('amount'),
        cell: ({ row }) => (
          <AmountLabel
            amount={row.original.amount}
            decimalPlaces={0}
            isChainNativeToken
          />
        ),
      },
      {
        accessorKey: 'inserted_at',
        header: t('time'),
        cell: ({ row }) =>
          formatUTCTime(new Date(row.original.inserted_at).getTime()),
      },
    ],
    [t],
  )

  return (
    <Card className="p-gap">
      <div className="mb-6 text-xl font-medium">
        {t('deposits') || 'Deposits'}
      </div>

      <DataTable
        columns={DepositsTableColumns}
        data={data || []}
        isLoading={isLoading}
        emptyMessage={t('noDeposits') || 'No deposits found'}
      />
    </Card>
  )
}
