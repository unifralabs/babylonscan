import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../common/dropdown-menu'
import { ArrowUpDownIcon } from '../icons/arrow-up-down'
import ChainLogo from './chain-logo'
import { Check } from 'lucide-react'

import {
  BABYLON_CHAINS,
  ChainNetworkEnum,
  COSMOS_CHAINS,
  CURRENT_CHAIN,
} from '@cosmoscan/shared/constants/chain'
import { cn } from '@cosmoscan/shared/utils'

export interface ChainSwitcherProps {
  classNames?: {
    root?: string
    trigger?: string
    content?: string
    item?: string
  }
  enabled?: boolean
  withText?: boolean
}

export default function ChainSwitcher({
  classNames,
  enabled = true,
  withText = true,
}: ChainSwitcherProps) {
  const SwitchChains = (
    CURRENT_CHAIN?.isBabylon ? BABYLON_CHAINS : COSMOS_CHAINS
  ).filter(({ network }) => network === ChainNetworkEnum.MAINNET)

  const switchable = enabled && SwitchChains.length > 1

  const SelectedChainContent = (
    <div
      className={cn(
        'text-primary-foreground flex-items-c w-full',
        switchable && withText ? 'justify-between' : 'justify-center',
        classNames?.trigger,
      )}
    >
      <ChainLogo
        type={CURRENT_CHAIN.type}
        className={!withText ? 'w-3/5' : 'w-4/5'}
        withText={withText}
      />
      {switchable && withText && <ArrowUpDownIcon className="w-2.5 md:w-3" />}
    </div>
  )

  return (
    <div className={classNames?.root}>
      {switchable ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {SelectedChainContent}
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={15} className={classNames?.content}>
            {SwitchChains.map(({ type, name }) => (
              <DropdownMenuItem key={name} className="px-page-gap py-3 md:py-4">
                <div
                  className={cn(
                    'flex-items-c w-full justify-between',
                    classNames?.item,
                  )}
                >
                  <ChainLogo
                    type={type}
                    className="text-primary-foreground w-3/5"
                  />
                  <Check
                    className={cn(
                      'text-primary stroke-4 h-5 w-5',
                      CURRENT_CHAIN.name === name ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        SelectedChainContent
      )}
    </div>
  )
}
