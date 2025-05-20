'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { Skeleton } from '../common/skeleton'
import { createIcon } from '@download/blockies'

import { cn } from '@cosmoscan/shared/utils'

interface BlockieAvatarProps {
  className?: string
  address: string
  alt?: string
  rounded?: boolean
}

export default function BlockieAvatar({
  className,
  address,
  rounded = true,
  alt = 'avatar',
}: BlockieAvatarProps) {
  const [imgSrc, setImgSrc] = useState('')

  useEffect(() => {
    const data: HTMLCanvasElement = createIcon({ seed: address.toLowerCase() })
    !!data && setImgSrc(data.toDataURL())
  }, [address])

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden',
        rounded && 'rounded-full',
        className,
      )}
    >
      {!!imgSrc ? (
        <Image
          className={cn('object-cover', rounded && 'rounded-full')}
          src={imgSrc}
          alt={alt}
          fill
        />
      ) : (
        <Skeleton className={cn('w-h-full', rounded && 'rounded-full')} />
      )}
    </div>
  )
}
