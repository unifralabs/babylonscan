'use client'

import { createElement, useCallback, useMemo } from 'react'

import { Button } from '../common/button'
import { Check, Copy } from 'lucide-react'
import { useCopyToClipboard, useToggle } from 'react-use'

import { cn } from '@cosmoscan/shared/utils'

export interface CopyIconProps {
  className?: string
  size?: number
  text?: string
  variant?: 'button'
}

export default function CopyIcon({
  className,
  size = 13,
  text = '',
  variant,
}: CopyIconProps) {
  const [, copy] = useCopyToClipboard()
  const [isCopied, toggleIsCopied] = useToggle(false)

  const onToggle = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (isCopied) return
      copy(text)
      toggleIsCopied(true)
      setTimeout(() => toggleIsCopied(false), 1000)
    },
    [copy, isCopied, text, toggleIsCopied],
  )

  const icon = useMemo(
    () => createElement(isCopied ? Check : Copy, { size }),
    [isCopied, size],
  )

  return 'button' === variant ? (
    <Button
      className={cn('text-foreground-secondary h-8 w-8', className)}
      variant="ghost"
      size="icon"
      onClick={onToggle}
    >
      {icon}
    </Button>
  ) : (
    <div
      className={cn(
        'text-foreground-secondary cursor-pointer transition-opacity hover:opacity-80',
        className,
      )}
      onClick={onToggle}
    >
      {icon}
    </div>
  )
}
