'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@cosmoscan/shared/utils'
import { Card } from '@cosmoscan/ui/card'

export interface BlocksAutoRefreshStatusProps {
  isFetching: boolean
  newBlocksCount: number
}

export function BlocksAutoRefreshStatus({
  isFetching,
  newBlocksCount,
}: BlocksAutoRefreshStatusProps) {
  const t = useTranslations('Block')
  const [showNewBlocks, setShowNewBlocks] = useState(false)

  useEffect(() => {
    if (newBlocksCount > 0) {
      setShowNewBlocks(true)
      const timer = setTimeout(() => {
        setShowNewBlocks(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [newBlocksCount])

  return (
    <Card className="text-card-foreground border-border-light rounded-lg border bg-secondary p-2 inline-block">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {showNewBlocks ? (
            <span className="text-sm">
              {t('newBlocksFound', { count: newBlocksCount })}
            </span>
          ) : (
            <span className="text-sm">{t('scanningNewBlocks')}</span>
          )}
        </div>
      </div>
    </Card>
  )
} 