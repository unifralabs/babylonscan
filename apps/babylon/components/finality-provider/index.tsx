import { createElement, ReactNode } from 'react'

import Image from 'next/image'

import { CircleCheck, Info } from 'lucide-react'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { FinalityProvidersStatusEnum } from '@cosmoscan/shared/types'
import { cn } from '@cosmoscan/shared/utils'
import BlockieAvatar from '@cosmoscan/ui/components/blockie-avatar'
import { BadgeIcon } from '@cosmoscan/ui/icons/badge'
import { Skeleton } from '@cosmoscan/ui/skeleton'

interface FinalityProviderAvatarNameWrapperProps {
  classNames?: {
    root?: string
    logo?: string
    name?: string
    statusIcon?: string
  }
  logo?: string
  name?: string
  address?: string
  status?: string | null
  rounded?: boolean
  extraContent?: ReactNode
  isLinkable?: boolean
}

export function FinalityProviderAvatarNameWrapper({
  classNames,
  logo,
  name,
  address,
  status,
  extraContent,
  rounded = true,
  isLinkable = false,
}: FinalityProviderAvatarNameWrapperProps) {
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
        ) : !!address ? (
          <BlockieAvatar
            className="w-h-full"
            address={address}
            rounded={rounded}
          />
        ) : (
          <Skeleton className={cn('w-h-full', rounded && 'rounded-full')} />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className={cn('flex-items-c gap-2', classNames?.name)}>
          {!!name ? (
            isLinkable ? (
              <ExternalLinkRenderer
                classNames={{ link: 'text-foreground hover:text-primary' }}
                type="finalityProvider"
                content={name}
                pathParamValue={address}
              />
            ) : (
              <span>{name}</span>
            )
          ) : (
            <Skeleton className="h-6 w-24" />
          )}
          {(status || '')?.toLowerCase() === 'active' && name && (
            <BadgeIcon
              className={cn(
                'h-[1.15rem] w-[1.15rem] text-[#00C7BE]',
                classNames?.statusIcon,
              )}
            />
          )}
        </div>
        {extraContent}
      </div>
    </div>
  )
}

export function FinalityProviderStatus({
  status,
}: {
  status?: FinalityProvidersStatusEnum | null
}) {
  if (!status) return null

  const metadata: Record<
    FinalityProvidersStatusEnum,
    { className: string; icon: any }
  > = {
    [FinalityProvidersStatusEnum.CREATED]: {
      className: 'bg-primary',
      icon: CircleCheck,
    },
    [FinalityProvidersStatusEnum.ACTIVE]: {
      className: 'bg-green',
      icon: CircleCheck,
    },
  }

  return (
    <div
      className={cn(
        'flex-c text-primary-foreground w-fit gap-2 rounded-md px-3 py-2 text-sm',
        metadata?.[status]?.className || 'bg-primary',
      )}
    >
      {createElement(metadata?.[status]?.icon || Info, {
        size: 12,
      })}
      <span className="capitalize">{status}</span>
    </div>
  )
}
