'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { clientApi } from '../../../trpc/react'
import { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { VoteCell } from '@cosmoscan/core/components/table-cell-renderer'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { VoteEnum } from '@cosmoscan/shared/types'
import { formatUTCTime, shortStr } from '@cosmoscan/shared/utils'
import { Badge } from '@cosmoscan/ui/badge'
import { Card } from '@cosmoscan/ui/card'
import DataTable from '@cosmoscan/ui/components/data-table'
import DataTabs from '@cosmoscan/ui/components/underline-tabs'
import { Input } from '@cosmoscan/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cosmoscan/ui/select'

export type ProposalVotesProps = {
  proposalId: number
}

type ProposalVoteItem = {
  id: number
  proposal_id?: bigint
  voter: string
  validator_name: string | null
  operator_address?: string | null
  vote_option: VoteEnum
  vote_weight?: string
  timestamp: bigint | null
  tx_hash?: string
  is_validator?: boolean
}

export default function ProposalVotesTable({ proposalId }: ProposalVotesProps) {
  const t = useTranslations('Proposal')
  const router = useRouter()
  const [voteFilter, setVoteFilter] = useState<string>('ALL')
  const [accountType, setAccountType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  )
  const [isResetting, setIsResetting] = useState(false)

  const {
    cursor,
    setCursor,
    currentPage,
    setCurrentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
    cursorsRef,
  } = useCursorPagination<{ id: number }>()

  // Use the unified API to fetch voting data
  const { data, isFetching } =
    clientApi.internal.proposal.fetchProposalVotes.useQuery({
      proposalId,
      take: 10,
      cursor,
      voteType: voteFilter as any,
      accountType: accountType as any,
      searchQuery: searchQuery.trim() || undefined,
    })

  // 更新nextCursor
  useEffect(() => {
    if (data) {
      setNextCursor(data.nextCursor)
    }
  }, [data, setNextCursor])

  // 完全重置分页状态
  const resetPagination = useCallback(() => {
    setIsResetting(true)
    setCursor(undefined)
    setCurrentPage(1)
    cursorsRef.current = [undefined]
    setIsResetting(false)
  }, [setCursor, setCurrentPage, cursorsRef])

  // 当过滤器变化时重置分页状态
  useEffect(() => {
    resetPagination()
  }, [voteFilter, accountType, resetPagination])

  const handleVoteFilterChange = (value: string) => {
    // 如果切换到DIDNOTVOTE且当前accountType是REGULAR，则重置为ALL
    if (value === 'DIDNOTVOTE' && accountType === 'REGULAR') {
      setAccountType('ALL')
    }
    setVoteFilter(value)
  }

  const handleAccountTypeChange = (value: string) => {
    setAccountType(value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set a new timeout to delay the API call
    const timeout = setTimeout(() => {
      resetPagination()
    }, 300)

    setSearchTimeout(timeout)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const VotesTableColumns: ColumnDef<ProposalVoteItem>[] = useMemo(() => {
    const columns: ColumnDef<ProposalVoteItem>[] = [
      {
        accessorKey: 'account_type',
        header: t('accountType'),
        cell: ({ row }) => {
          const isValidator = row.original.is_validator
          return isValidator ? (
            <Badge variant="outline" className="px-2 py-1">
              {t('validator')}
            </Badge>
          ) : (
            <Badge variant="secondary" className="px-2 py-1">
              {t('regularAccount')}
            </Badge>
          )
        },
        size: 120,
      },
    ]

    // Only add the name column if we're showing validators
    if (accountType !== 'REGULAR') {
      columns.push({
        accessorKey: 'validator_name',
        header: t('name'),
        cell: ({ row }) => {
          const validatorName = row.original.validator_name
          const operatorAddress = row.original.operator_address
          const isValidator = row.original.is_validator

          // Only render the name for validators
          if (!isValidator || !operatorAddress) return null

          return (
            <ExternalLinkRenderer
              type="validator"
              content={validatorName || '-'}
              pathParamValue={operatorAddress}
              showTooltip={false}
            />
          )
        },
      })
    }

    // Add the remaining columns
    columns.push(
      {
        accessorKey: 'voter',
        header: t('address'),
        cell: ({ row }) => {
          const voter = row.original.voter
          return (
            <ExternalLinkRenderer
              type="address"
              content={shortStr(voter)}
              pathParamValue={voter}
              showTooltip={true}
            />
          )
        },
      },
      {
        accessorKey: 'vote_option',
        header: t('vote'),
        cell: ({ row }) => <VoteCell vote={row.original.vote_option} />,
      },
      {
        accessorKey: 'tx_hash',
        header: t('txHash'),
        cell: ({ row }) =>
          row.original.tx_hash ? (
            <ExternalLinkRenderer
              type="transaction"
              content={row.original.tx_hash}
              isCopyable
            />
          ) : (
            '-'
          ),
      },
      {
        accessorKey: 'timestamp',
        header: t('time'),
        cell: ({ row }) =>
          row.original.timestamp
            ? formatUTCTime(Number(row.original.timestamp))
            : '-',
      },
    )

    return columns
  }, [t, router, accountType])

  // Determine if account type filter should be disabled
  const isAccountTypeDisabled = voteFilter === 'DIDNOTVOTE'

  return (
    <Card className="p-gap">
      <div className="space-y-6">
        <DataTabs
          variant="underlined"
          activeTab={voteFilter}
          onValueChange={handleVoteFilterChange}
          tabs={[
            {
              value: 'ALL',
              valueContent: t('allVotes'),
              content: null,
            },
            {
              value: 'YES',
              valueContent: t('yes'),
              content: null,
            },
            {
              value: 'NO',
              valueContent: t('no'),
              content: null,
            },
            {
              value: 'VETO',
              valueContent: t('veto'),
              content: null,
            },
            {
              value: 'ABSTAIN',
              valueContent: t('abstain'),
              content: null,
            },
            {
              value: 'DIDNOTVOTE',
              valueContent: t('didNotVote'),
              content: null,
            },
          ]}
        />

        <DataTable
          paginationProps={{
            currentPage,
            hasPreviousPage,
            hasNextPage,
            fetchFirstPage,
            fetchPreviousPage,
            fetchNextPage,
            isLoading: isFetching || isResetting,
          }}
          filterComponent={
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Select
                defaultValue="ALL"
                value={accountType}
                onValueChange={handleAccountTypeChange}
                disabled={isAccountTypeDisabled}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('allAccounts')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('allAccounts')}</SelectItem>
                  <SelectItem value="VALIDATORS">
                    {t('validatorsOnly')}
                  </SelectItem>
                  <SelectItem value="REGULAR">
                    {t('regularAccounts')}
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-full sm:w-[250px]">
                <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8"
                />
              </div>
            </div>
          }
          columns={VotesTableColumns}
          data={(data?.items || []) as unknown as ProposalVoteItem[]}
          isLoading={isFetching || isResetting}
        />
      </div>
    </Card>
  )
}
