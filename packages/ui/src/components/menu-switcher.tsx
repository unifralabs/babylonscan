'use client'

import { Button } from '../common/button'
import { MenuToggleIcon } from '../icons/menu/toggle'

import { useCommonStore } from '@cosmoscan/shared/providers/common-store-provider'
import { cn } from '@cosmoscan/shared/utils'

interface MenuSwitcherProps {
  classNames?: {
    button?: string
    icon?: string
  }
}

export default function MenuSwitcher({ classNames }: MenuSwitcherProps) {
  const isMenuCollapsed = useCommonStore(state => state.isMenuCollapsed)
  const toggleMenuCollapsed = useCommonStore(state => state.toggleMenuCollapsed)

  return (
    <Button
      className={classNames?.button}
      variant="ghost"
      size="icon"
      onClick={() => toggleMenuCollapsed()}
    >
      <MenuToggleIcon
        className={cn(
          '!size-4 transition-all',
          isMenuCollapsed && 'rotate-180',
          classNames?.icon,
        )}
      />
    </Button>
  )
}
