'use client'

import Link from 'next/link'

import { useLocale } from 'next-intl'

import {
  VoteDict,
  VoteEnum,
  VoteStatusDict,
  VoteStatusEnum,
} from '@cosmoscan/shared/types'
import {
  cn,
  formatNumWithCommas,
  formatTimeAgo,
  formatUTCTime,
  shortStr,
} from '@cosmoscan/shared/utils'
import {
  formatMempoolAddressUrl,
  formatMempoolBlockUrl,
  formatMempoolTxUrl,
} from '@cosmoscan/shared/utils/btc'
import CopyIcon from '@cosmoscan/ui/components/copy-icon'
import { ArrowRightIcon } from '@cosmoscan/ui/icons/arrow-right'
import { Tooltip } from '@cosmoscan/ui/tooltip'

export interface TableMempoolHashCellProps {
  classNames?: {
    root?: string
    link?: string
    copyIcon?: string
  }
  type: 'block' | 'tx' | 'address'
  hash?: string | null
  short?: boolean
  shortOptions?: { start?: number; end?: number }
  isCopyable?: boolean
  copyIconSize?: number
}

export function TableMempoolHashCell({
  classNames,
  type,
  hash,
  short = true,
  shortOptions,
  isCopyable = false,
  copyIconSize,
}: TableMempoolHashCellProps) {
  if (!!!hash) return '-'

  const link = (
    <Link
      className={cn('link', classNames?.link)}
      href={
        type === 'block'
          ? formatMempoolBlockUrl(hash)
          : type === 'tx'
            ? formatMempoolTxUrl(hash)
            : formatMempoolAddressUrl(hash)
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      {'block' === type
        ? formatNumWithCommas(hash)
        : short
          ? shortStr(hash, shortOptions)
          : hash}
    </Link>
  )

  const content = short ? <Tooltip content={hash}>{link}</Tooltip> : link

  return (
    <div className={cn('flex-items-c gap-2', classNames?.root)}>
      {content}
      {isCopyable && (
        <CopyIcon
          className={classNames?.copyIcon}
          size={copyIconSize}
          text={hash}
        />
      )}
    </div>
  )
}

export function TableAgeCell({
  className,
  time,
}: {
  className?: string
  time?: number | string | bigint
}) {
  const locale = useLocale()

  if (!!!time) return '-'

  return (
    <Tooltip content={formatUTCTime(time)}>
      <div className={cn('w-fit', className)}>
        {formatTimeAgo(time, locale)}
      </div>
    </Tooltip>
  )
}

export function ArrowRightCell({ className }: { className?: string }) {
  return (
    <div className={cn('flex-c text-primary', className)}>
      <div className="flex-c bg-accent h-8 w-8 rounded-full">
        <ArrowRightIcon className="h-4 w-4" />
      </div>
    </div>
  )
}

export function TransactionTypesCell({
  types,
  withBorder = true,
}: {
  types?: string[]
  withBorder?: boolean
}) {
  if (!!!types?.length) return '-'

  const content = (
    <div className="flex-items-c w-fit gap-2">
      <div
        className={cn(
          'w-fit rounded-md',
          withBorder &&
            'border-foreground border px-2 py-1 text-xs md:px-3.5 md:py-1.5',
        )}
      >
        {types?.[0]}
      </div>
      {types.length > 1 && (
        <span className="text-foreground-secondary text-xs md:text-sm">
          +{types.length - 1}
        </span>
      )}
    </div>
  )

  return types.length > 1 ? (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          {types.map((text, index) => (
            <div key={text + index} className="text-left">
              {text}{' '}
            </div>
          ))}
        </div>
      }
    >
      {content}
    </Tooltip>
  ) : (
    content
  )
}

export function VoteCell({ vote }: { vote: VoteEnum }) {
  return (
    <span
      className={cn(
        [VoteEnum.YES].includes(vote)
          ? 'text-green'
          : [VoteEnum.NO, VoteEnum.ABSTAIN, VoteEnum.VETO].includes(vote)
            ? 'text-red'
            : vote === VoteEnum.DIDNOTVOTE
              ? 'text-gray-400'
              : 'text-orange-500',
      )}
    >
      {VoteDict[vote]}
    </span>
  )
}

export function VoteStatusCell({ status }: { status?: VoteStatusEnum }) {
  if (null === status || undefined === status) return '-'

  return (
    <span
      className={cn(
        VoteStatusEnum.PASSED === status
          ? 'text-green'
          : VoteStatusEnum.REJECTED === status
            ? 'text-red'
            : VoteStatusEnum.VOTING_PERIOD === status
              ? 'text-orange-500'
              : 'text-foreground',
      )}
    >
      {VoteStatusDict[status]}
    </span>
  )
}
