'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../common/dropdown-menu'
import { Check, ChevronDown } from 'lucide-react'

import {
  BABYLON_CHAINS,
  ChainNetworkEnum,
  COSMOS_CHAINS,
  CURRENT_CHAIN,
} from '@cosmoscan/shared/constants/chain'
import { cn } from '@cosmoscan/shared/utils'

export default function NetworkSwitcher() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Use CURRENT_CHAIN.network as the single source of truth
  const currentNetwork = CURRENT_CHAIN?.network || ChainNetworkEnum.MAINNET

  const SwitchChains = (
    CURRENT_CHAIN?.isBabylon ? BABYLON_CHAINS : COSMOS_CHAINS
  ).filter(
    chain =>
      chain.network === ChainNetworkEnum.MAINNET ||
      chain.network === ChainNetworkEnum.TESTNET,
  )

  const getDomain = (network: string) => {
    if (network === ChainNetworkEnum.MAINNET) {
      return 'https://babylon.l2scan.co'
    }
    return 'https://babylon-testnet.l2scan.co'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="bg-foreground flex-c text-primary-foreground h-7 whitespace-nowrap rounded-md px-3 text-sm md:h-9">
          {currentNetwork === ChainNetworkEnum.MAINNET ? 'Mainnet' : 'Testnet'}
          <ChevronDown className="ml-1 h-3.5 w-3.5" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={15}>
        {SwitchChains.map(chain => {
          const href = getDomain(chain.network)

          return (
            <Link key={`${chain.type}-${chain.network}`} href={href}>
              <DropdownMenuItem className="px-page-gap py-3 md:py-4">
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm">
                    {chain.network === ChainNetworkEnum.MAINNET
                      ? 'Mainnet'
                      : 'Testnet'}
                  </span>
                  <Check
                    className={cn(
                      'text-primary stroke-4 h-5 w-5',
                      currentNetwork === chain.network
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </div>
              </DropdownMenuItem>
            </Link>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
