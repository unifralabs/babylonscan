import { MouseEventHandler, PropsWithChildren } from 'react'

import CopyIcon from './copy-icon'

import { cn } from '@cosmoscan/shared/utils'

export type CopyWrapperProps = PropsWithChildren<{
  classNames?: {
    root?: string
    icon?: string
  }
  copyText?: string
  iconSize?: number
  onClick?: MouseEventHandler<HTMLDivElement>
}>

export default function CopyWrapper({
  classNames,
  copyText = '',
  iconSize,
  children,
  onClick,
}: CopyWrapperProps) {
  return (
    <div
      className={cn('flex-items-c gap-2 break-all', classNames?.root)}
      onClick={onClick}
    >
      {children}
      <CopyIcon className={classNames?.icon} text={copyText} size={iconSize} />
    </div>
  )
}
