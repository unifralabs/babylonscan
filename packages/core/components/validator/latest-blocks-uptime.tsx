'use client'

import { useEffect, useRef, useState } from 'react'

import { clientApi } from '../../trpc/react'
import { useTranslations } from 'next-intl'

import { Tooltip } from '@cosmoscan/ui/tooltip'

interface BlockSignature {
  height: number
  signed: boolean
  isNew?: boolean
}

interface LatestBlocksUptimeProps {
  address: string
  limit?: number
  refreshInterval?: number // Refresh interval in milliseconds
}

export default function LatestBlocksUptime({
  address,
  limit = 100,
  refreshInterval = 10000, // Default to refresh every 10 seconds
}: LatestBlocksUptimeProps) {
  const t = useTranslations('Validator')
  const [signatures, setSignatures] = useState<BlockSignature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevDataRef = useRef<BlockSignature[]>([])

  // Use TRPC useQuery hook to fetch validator's latest block signatures
  const { data, isError } =
    clientApi.internal.validator.fetchValidatorLatestBlockSignatures.useQuery(
      {
        address,
        limit,
      },
      {
        refetchInterval: refreshInterval,
        retry: 3,
      },
    )

  // Update state when data is available and detect new blocks
  useEffect(() => {
    if (data) {
      // Ensure data is sorted by height in descending order (newest blocks first)
      const sortedData = [...data].sort((a, b) => b.height - a.height)

      // Convert any non-boolean signed values to proper booleans
      const normalizedData = sortedData.map(block => {
        // Handle different types of signed values
        let isSigned = false

        if (typeof block.signed === 'boolean') {
          isSigned = block.signed
        } else if (typeof block.signed === 'number') {
          isSigned = block.signed === 1
        } else if (typeof block.signed === 'string') {
          isSigned = block.signed === 'true' || block.signed === '1'
        } else if (block.signed) {
          // Fallback for any other truthy value
          isSigned = true
        }

        return {
          height: block.height,
          signed: isSigned,
          isNew: false,
        }
      })

      // Check for new blocks
      if (prevDataRef.current.length > 0) {
        const newBlockHeights = new Set(
          normalizedData
            .filter(
              block =>
                !prevDataRef.current.some(
                  prevBlock => prevBlock.height === block.height,
                ),
            )
            .map(block => block.height),
        )

        // Mark new blocks
        if (newBlockHeights.size > 0) {
          console.log('New blocks detected:', Array.from(newBlockHeights))

          // Add isNew flag to new blocks
          normalizedData.forEach(block => {
            if (newBlockHeights.has(block.height)) {
              block.isNew = true
            }
          })

          // Clear isNew flag after animation completes
          setTimeout(() => {
            setSignatures(prev =>
              prev.map(block => ({ ...block, isNew: false })),
            )
          }, 2000)
        }
      }

      setSignatures(normalizedData)
      setIsLoading(false)
      prevDataRef.current = normalizedData
    }
  }, [data])

  // Handle error state
  useEffect(() => {
    if (isError) {
      console.error('Error fetching validator signatures')
      setError('Failed to load block signatures')
    }
  }, [isError])

  if (error) {
    return <div className="text-red">{error}</div>
  }

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: limit }).map((_, index) => (
          <div
            key={index}
            className="h-5 w-5 rounded-sm bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    )
  }

  if (!signatures || signatures.length === 0) {
    return (
      <div className="text-gray-500">No block signature data available</div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {signatures.map((block, index) => (
        <Tooltip
          key={block.height}
          content={
            <div className="text-center">
              <div className="font-medium">
                {t('block')} #{block.height}
              </div>
              <div className={block.signed ? 'text-green' : 'text-red'}>
                {block.signed ? t('signed') : t('missed')}
              </div>
            </div>
          }
        >
          <div
            className={`h-5 w-5 cursor-pointer rounded-sm ${
              block.signed ? 'bg-green' : 'bg-red'
            } ${
              block.isNew
                ? 'shadow-green/50 z-10 scale-125 animate-pulse shadow-lg transition-all duration-700'
                : 'transition-all duration-500'
            }`}
            style={{
              transform: block.isNew ? 'translateY(-2px)' : 'none',
              boxShadow: block.isNew
                ? '0 0 8px 2px rgba(0, 255, 0, 0.3)'
                : 'none',
            }}
          />
        </Tooltip>
      ))}
    </div>
  )
}
