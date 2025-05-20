import { createElement } from 'react'

import { DownIcon } from '../icons/down'
import { RaiseIcon } from '../icons/raise'

import { cn, formatNumWithPercent } from '@cosmoscan/shared/utils'

export interface IncreaseLabelProps {
  classNames?: {
    root?: string
    iconWrapper?: string
    icon?: string
  }
  value?: number | bigint | string | null
  showIcon?: boolean
}

export default function IncreaseLabel({
  classNames,
  value = 0,
  showIcon = true,
}: IncreaseLabelProps) {
  const _value = Number(value)
  if (0 === _value) return '-'

  const icon = _value > 0 ? RaiseIcon : DownIcon
  const color = _value > 0 ? 'text-green' : 'text-red'

  return (
    <div
      className={cn('flex-items-c gap-1 font-medium', classNames?.root, color)}
    >
      {showIcon ? (
        <div className={cn('flex-c h-6 w-6', classNames?.iconWrapper)}>
          {createElement(icon, {
            className: cn('h-3.5 w-3.5', classNames?.icon),
          })}
        </div>
      ) : (
        <span>{_value > 0 ? '+' : '-'}</span>
      )}
      <span>{formatNumWithPercent(Math.abs(_value))}</span>
    </div>
  )
}
