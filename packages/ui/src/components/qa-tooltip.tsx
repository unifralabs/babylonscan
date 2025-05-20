import { PropsWithChildren, ReactNode } from 'react'

import { Tooltip, TooltipProps } from '../common/tooltip'
import { CircleHelp } from 'lucide-react'

import { cn } from '@cosmoscan/shared/utils'

export type QATooltipProps = PropsWithChildren<
  {
    classNames?: {
      root?: string
      tooltip?: string
      icon?: string
    }
    content?: ReactNode
    size?: number
    iconPosition?: 'left' | 'right'
  } & Pick<TooltipProps, 'side' | 'sideOffset'>
>

export default function QATooltip({
  classNames,
  content,
  size = 13,
  children,
  iconPosition = 'left',
  ...props
}: QATooltipProps) {
  return (
    <div
      className={cn(
        'flex-items-c gap-2',
        'right' === iconPosition && 'flex-row-reverse',
        classNames?.root,
      )}
    >
      <Tooltip className={classNames?.tooltip} content={content} {...props}>
        <CircleHelp className={classNames?.icon} size={size} />
      </Tooltip>
      {children}
    </div>
  )
}
