import Image from 'next/image'

import { Skeleton } from '../common/skeleton'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { cn } from '@cosmoscan/shared/utils'

export interface TokenProps {
  classNames?: {
    root?: string
    logo?: string
    name?: string
  }
  logo?: string
  name?: string | null
  denom?: string
  isLinkable?: boolean
}

export default function Token({
  classNames,
  name,
  logo,
  denom,
  isLinkable = true,
}: TokenProps) {
  return (
    <div className={cn('flex-items-c gap-2 md:gap-4', classNames?.root)}>
      <div
        className={cn(
          'flex-c relative size-8 shrink-0 rounded-full md:size-10',
          classNames?.logo,
        )}
      >
        {!!logo ? (
          <Image
            className="rounded-full object-cover"
            src={logo}
            alt="token_logo"
            fill
          />
        ) : (
          <Skeleton className="w-h-full rounded-full" />
        )}
      </div>

      <div className={cn('max-w-[200px] truncate', classNames?.name)}>
        {isLinkable ? (
          <ExternalLinkRenderer
            type="token"
            content={name || '-'}
            pathParamValue={denom}
            short={false}
          />
        ) : (
          name || '-'
        )}
      </div>
    </div>
  )
}
