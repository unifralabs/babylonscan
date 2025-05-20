import { ReactNode } from 'react'

import { Skeleton } from '../common/skeleton'
import { Tooltip } from '../common/tooltip'
import { QaIcon } from '../icons/qa'

import { cn } from '@cosmoscan/shared/utils'

export interface DetailItemProps {
  classNames?: {
    item?: string
    label?: string
    value?: string
  }
  label: ReactNode
  tooltip?: ReactNode
  value?: ReactNode
}

export function DetailItem({
  classNames,
  label,
  tooltip,
  value,
}: DetailItemProps) {
  const labelContent = (
    <div
      className={cn(
        'text-foreground-secondary flex-items-c w-1/5 min-w-[170px] max-w-[270px] shrink-0 gap-2 whitespace-nowrap capitalize',
        classNames?.label,
      )}
    >
      {label}
    </div>
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-2 lg:flex-row lg:items-center',
        classNames?.item,
      )}
    >
      {!!tooltip ? (
        <div className="flex-items-c gap-2">
          <Tooltip content={tooltip}>
            <QaIcon className="h-5 w-5" />
          </Tooltip>
          {labelContent}
        </div>
      ) : (
        labelContent
      )}
      {undefined !== value && (
        <div className={cn('flex-1', classNames?.value)}>{value}</div>
      )}
    </div>
  )
}

export interface DetailItemsProps {
  classNames?: {
    root?: string
    item?: string
    label?: string
    value?: string
  }
  items: DetailItemProps[]
  showSkeleton?: boolean
}

export default function DetailItems({ classNames, items }: DetailItemsProps) {
  return (
    <div className={cn('gap-page-gap flex flex-col py-2', classNames?.root)}>
      {items.map((item, index) => (
        <DetailItem key={index} {...item} />
      ))}
    </div>
  )
}

export interface DetailItemsSkeletonProps {
  classNames?: {
    root?: string
    skeleton?: string
  }
  items: ReactNode[]
}

export function DetailItemsSkeleton({
  classNames,
  items,
}: DetailItemsSkeletonProps) {
  return (
    <div className={cn('gap-page-gap flex flex-col py-2', classNames?.root)}>
      {items.map((item, index) => (
        <DetailItem
          key={index}
          label={item}
          value={<Skeleton className={cn('h-6 w-2/5', classNames?.skeleton)} />}
        />
      ))}
    </div>
  )
}
