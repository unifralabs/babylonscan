import { ReactNode } from 'react'

import Image from 'next/image'

import { serverApi } from '../../trpc/server'

import { cn } from '@cosmoscan/shared/utils'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import { Skeleton } from '@cosmoscan/ui/skeleton'

export async function TokenWithDenom({
  amount,
  denom,
}: {
  amount?: string | null | number | bigint
  denom: string
}) {
  const token = await serverApi.internal.token.fetchTokenDetailByDenom(denom)

  return (
    <AmountLabel
      amount={BigInt(Number(amount ?? 0))}
      currency={token?.display_denom || ''}
      decimals={token?.decimals}
      isChainNativeToken={!!!token?.display_denom}
    />
  )
}

interface TokenDetailAvatarNameWrapperProps {
  classNames?: {
    root?: string
    logo?: string
    name?: string
    statusIcon?: string
  }
  logo?: string
  denom?: string
  name?: string | null
  symbol?: string | null
  extraContent?: ReactNode
  rounded?: boolean
  isLinkable?: boolean
}

export function TokenDetailAvatarNameWrapper({
  classNames,
  logo,
  name,
  symbol,
  rounded = true,
}: TokenDetailAvatarNameWrapperProps) {
  return (
    <div className={cn('flex-items-c gap-4', classNames?.root)}>
      <div
        className={cn(
          'flex-c relative h-10 w-10 shrink-0',
          rounded && 'rounded-full',
          classNames?.logo,
        )}
      >
        {!!logo ? (
          <Image
            className={cn('object-cover', rounded && 'rounded-full')}
            src={logo}
            alt="avatar"
            fill
          />
        ) : (
          <Skeleton className={cn('w-h-full', rounded && 'rounded-full')} />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className={cn('flex-items-c gap-2', classNames?.name)}>
          {!!name ? <span>{name}</span> : <Skeleton className="h-6 w-24" />}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            'flex-items-c gap-2 text-[#ffffff66]',
            classNames?.name,
          )}
        >
          {!!symbol ? <span>{symbol}</span> : <Skeleton className="h-5 w-20" />}
        </div>
      </div>
    </div>
  )
}
