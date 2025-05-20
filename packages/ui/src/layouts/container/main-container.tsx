'use client'

import { PropsWithChildren } from 'react'

import { useCommonStore } from '@cosmoscan/shared/providers/common-store-provider'
import { cn } from '@cosmoscan/shared/utils'

export interface MainContainerProps
  extends PropsWithChildren<{ className?: string }> {}

export default function MainContainer({
  className,
  children,
}: MainContainerProps) {
  const isMenuCollapsed = useCommonStore(state => state.isMenuCollapsed)
  return (
    <main
      className={cn(
        'w-full',
        isMenuCollapsed
          ? 'md:w-[calc(100%-theme(spacing.menu-collapse-w))]'
          : 'md:w-[calc(100%-theme(spacing.menu-w))]',
        className,
      )}
    >
      {children}
    </main>
  )
}
