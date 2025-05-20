'use client'

import { useCallback, useMemo } from 'react'

import { useSearchParams } from 'next/navigation'

import { useTranslations } from 'next-intl'

import type { FinalityProviderDetail } from '@cosmoscan/core-api'
import { cn } from '@cosmoscan/shared/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@cosmoscan/ui/select'

interface FinalityProviderChainsSelectProps {
  classNames?: {
    trigger?: string
    value?: string
    content?: string
    item?: string
  }
  chains?: FinalityProviderDetail['supported_chains']
}

export default function FinalityProviderChainsSelect({
  classNames,
  chains = [],
}: FinalityProviderChainsSelectProps) {
  const search = useSearchParams()
  const t = useTranslations('Common')

  const selectedChain = useMemo(
    () => search.get('chain') || chains?.[0],
    [chains, search],
  )

  const onValueChange = useCallback(
    (
      chain: NonNullable<FinalityProviderDetail['supported_chains']>[number],
    ) => {
      console.log(chain)
    },
    [],
  )

  if (!!!chains?.length) return null

  return (
    <Select value={selectedChain} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          'bg-secondary text-primary w-fit gap-2 border-none px-5 text-base',
          classNames?.trigger,
        )}
      >
        <span className="mr-1 capitalize">{selectedChain}</span>
        <span>{t('chain')}</span>
      </SelectTrigger>
      <SelectContent className={classNames?.content}>
        {chains?.map(chain => (
          <SelectItem
            key={chain}
            className={cn('text-base', classNames?.item)}
            value={chain}
          >
            <span className="mr-1 capitalize">{chain}</span>
            <span>{t('chain')}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
