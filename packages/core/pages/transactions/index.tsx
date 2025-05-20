'use client'

import { useEffect, useState } from 'react'

import { clientApi } from '../../trpc/react'
import { useTranslations } from 'next-intl'

import type { TransactionListInput } from '@cosmoscan/core-api'
import TransactionsAutoRefreshStatus from '@cosmoscan/core/components/transactions-auto-refresh-status'
import { TransactionsTable } from '@cosmoscan/core/components/transaction'
import { Card } from '@cosmoscan/ui/card'

export interface TransactionsProps {
  searchParams: { block?: string }
}

export default function Transactions({ searchParams }: TransactionsProps) {
  const t = useTranslations()
  const [newTransactionsCount, setNewTransactionsCount] = useState(0)
  const [lastTransactionHeight, setLastTransactionHeight] = useState<bigint | null>(null)

  // Separate query for status checking
  const { data: statusData, isFetching: isStatusFetching } =
    clientApi.internal.transaction.fetchInfiniteTransactions.useQuery({
      filter: {},
      take: 1, // Only fetch the latest transaction
    }, {
      refetchInterval: 10000, // Query for new data every 10 seconds
    })

  // Auto-refresh status check logic
  useEffect(() => {
    if (statusData?.items?.[0]?.height) {
      if (lastTransactionHeight && statusData.items[0].height !== lastTransactionHeight) {
        // Count new transactions by comparing heights
        const newTransactions = statusData.items.filter(
          (tx) => !lastTransactionHeight || tx.height > lastTransactionHeight
        ).length
        setNewTransactionsCount(newTransactions)
        
        // Auto-refresh if more than 20 new transactions
        if (newTransactions > 20) {
          window.location.reload()
        }
      }
      setLastTransactionHeight(statusData.items[0].height)
    }
  }, [statusData?.items, lastTransactionHeight])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <TransactionsAutoRefreshStatus
          isFetching={isStatusFetching}
          newTransactionsCount={newTransactionsCount}
        />
      </div>
      <Card className="p-gap w-full">
        <TransactionsTable block={searchParams?.block} isPageTable />
      </Card>
    </div>
  )
}
