'use client'

import React from 'react'
import { Tooltip } from '@cosmoscan/ui/tooltip'
import { cn } from '@cosmoscan/shared/utils'

interface SignatureBlockProps {
  height: number
  signed: number
}

interface SignatureHeatmapProps {
  blocks: SignatureBlockProps[]
  loading?: boolean
}

/**
 * Component to display a heatmap of finality provider signatures for the last 70 blocks
 */
export default function SignatureHeatmap({ blocks, loading = false }: SignatureHeatmapProps) {
  if (loading) {
    // Display skeleton loading state
    return (
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} className="h-7 w-7 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  // If no blocks, show empty state
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No signature data available
      </div>
    )
  }

  // Get all unique heights to compute ranges for empty slots
  const allHeights = blocks.map(block => block.height)
  const minHeight = Math.min(...allHeights, Number.MAX_SAFE_INTEGER)
  const maxHeight = Math.max(...allHeights, 0)

  // Create blocks array with placeholders for missing heights
  const displayBlocks: (SignatureBlockProps | null)[] = []
  for (let height = minHeight; height <= maxHeight; height++) {
    const block = blocks.find(b => b.height === height)
    if (block) {
      displayBlocks.push(block)
    } else {
      // Add null for missing blocks
      displayBlocks.push(null)
    }
  }

  // Take only the last 70 blocks
  const lastBlocks = displayBlocks.slice(-70)

  return (
    <div className="flex flex-wrap gap-1">
      {lastBlocks.map((block, i) => {
        if (!block) {
          // Missing block
          return (
            <div
              key={i}
              className="h-7 w-7 rounded-sm bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500"
            />
          )
        }

        return (
          <Tooltip
            key={i}
            content={
              <div>
                <p>Block #{block.height}</p>
                <p>{block.signed ? 'Signed' : 'Missed'}</p>
              </div>
            }
            side="top"
            className="text-xs"
          >
            <div
              className={cn(
                'h-7 w-7 cursor-pointer rounded-sm flex items-center justify-center border',
                block.signed
                  ? 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-700 shadow-sm'
                  : 'bg-rose-500 dark:bg-rose-600 border-rose-600 dark:border-rose-700 shadow-sm'
              )}
            />
          </Tooltip>
        )
      })}
    </div>
  )
} 