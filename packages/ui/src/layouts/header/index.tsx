
import ChainSwitcher from '../../components/chain-switcher'
import SearchInput from '../../components/search-input'
import ThemeSwitcher from '../../components/theme-switcher'
import { MenuProps, MobileMenu } from '../menu'
import LangSwitcher from './lang-switcher'
import NetworkSwitcher from './network-switcher'

import { cn } from '@cosmoscan/shared/utils'


export interface HeaderProps {
  className?: string
  menuData?: MenuProps['menuData']
}

export default function Header({ className, menuData }: HeaderProps) {
  return (
    <header className={cn('w-full', className)}>
      <div className="px-page-gap bg-card flex-bt-c h-mobile-header-h border-border-light flex border-b py-3 md:h-auto">
        <ChainSwitcher
          classNames={{
            root: 'flex md:hidden',
            trigger: 'justify-start text-foreground',
          }}
          withText={false}
        />
        <SearchInput classNames={{ root: 'hidden md:flex' }} />
        <div className="flex-items-c gap-2 md:gap-4">
          <NetworkSwitcher />
          <ThemeSwitcher />
          <LangSwitcher />
          <MobileMenu menuData={menuData} />
        </div>
      </div>

      <div className="bg-background h-px w-full md:hidden"></div>
      <SearchInput
        classNames={{
          root: 'px-page-gap bg-card flex py-1 md:hidden border-b border-border-light',
        }}
        inputBordered={false}
      />
    </header>
  )
}
