'use client'

import { useEffect, useState } from 'react'

import { useInterval } from 'react-use'

import { cn } from '@cosmoscan/shared/utils'

interface LoadingDotProps {
  className?: string
  time?: number
}

export default function LoadingDot({ className, time = 500 }: LoadingDotProps) {
  const [dot, setDot] = useState('')

  useInterval(() => {
    setDot(pre => {
      if (pre.length < 3) {
        return (pre += '.')
      }
      return ''
    })
  }, time)

  return <div className={cn('h-fit w-fit', className)}>{dot}</div>
}
