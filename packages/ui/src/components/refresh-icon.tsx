'use client'

import { useCallback } from 'react'

import { Button } from '../common/button'
import { RefreshCw } from 'lucide-react'
import { useToggle } from 'react-use'

import { cn } from '@cosmoscan/shared/utils'

export interface RefreshIconProps {
  className?: string
  size?: number
  onClick?: () => void
  variant?: 'button'
}

export default function RefreshIcon({
  className,
  size = 13,
  onClick: _onClick,
  variant,
}: RefreshIconProps) {
  const [spin, toggleSpin] = useToggle(false)

  const onClick = useCallback(() => {
    if (spin) return
    toggleSpin(true)
    _onClick?.()
    setTimeout(() => {
      toggleSpin(false)
    }, 1000)
  }, [_onClick, spin, toggleSpin])

  const content = (
    <RefreshCw className={cn(spin && 'animate-spin')} size={size} />
  )

  return 'button' === variant ? (
    <Button
      className={cn('h-8 w-8', className)}
      variant="ghost"
      size="icon"
      onClick={onClick}
    >
      {content}
    </Button>
  ) : (
    <div
      className={cn(
        'text-foreground-secondary h-fit w-fit cursor-pointer transition-opacity hover:opacity-80',
        className,
      )}
      onClick={onClick}
    >
      {content}
    </div>
  )
}
