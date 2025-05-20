'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@cosmoscan/shared/utils'
import { Card } from '@cosmoscan/ui/card'

export interface TransactionsAutoRefreshStatusProps {
  isFetching: boolean
  newTransactionsCount?: number
}

export default function TransactionsAutoRefreshStatus({
  isFetching,
  newTransactionsCount = 0,
}: TransactionsAutoRefreshStatusProps) {
  const t = useTranslations()
  const [showNewTransactions, setShowNewTransactions] = useState(false)

  useEffect(() => {
    if (newTransactionsCount > 0) {
      setShowNewTransactions(true)
      const timer = setTimeout(() => {
        setShowNewTransactions(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [newTransactionsCount])

  return (
    <Card className="bg-secondary p-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            isFetching ? 'bg-primary animate-pulse' : 'bg-[#00C7BE]',
          )}
        />
        <span className="text-sm">
          {showNewTransactions
            ? t('Transaction.newTransactionsFound', {
                count: newTransactionsCount,
              })
            : t('Transaction.scanningNewTransactions')}
        </span>
      </div>
    </Card>
  )
} 