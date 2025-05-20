import { PropsWithChildren } from 'react'

import { AmountLabel, AmountLabelProps } from './amount-label'

import { cn, formatNumWithPercent } from '@cosmoscan/shared/utils'
import CircleProgress from '@cosmoscan/ui/circle-progress'

export type PercentLabelProps = PropsWithChildren<{
  classNames?: {
    root?: string
    circle?: string
    percent?: string
  }
  percent?: number | bigint
}>

export function PercentLabel({
  classNames,
  percent = 0,
  children,
}: PercentLabelProps) {
  return (
    <div className={cn('flex-items-c gap-4', classNames?.root)}>
      <CircleProgress
        className={cn('h-6 w-6', classNames?.circle)}
        value={Number(percent) * 100}
      />
      <div className="flex-items-c gap-1">
        {children}
        <span className={classNames?.percent}>
          ({formatNumWithPercent(percent)})
        </span>
      </div>
    </div>
  )
}

export type AmountPercentLabelProps = {
  amountClassName?: string
  amount?: number | bigint
} & PercentLabelProps &
  AmountLabelProps

export function AmountPercentLabel({
  amountClassName,
  amount = 0n,
  ...props
}: AmountPercentLabelProps) {
  return (
    <PercentLabel {...props}>
      <AmountLabel
        className={amountClassName}
        amount={BigInt(Number(amount))}
        {...props}
      />
    </PercentLabel>
  )
}
