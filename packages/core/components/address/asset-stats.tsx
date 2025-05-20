'use client'

import { Boxes, ChevronDown, Gift, Wallet } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@cosmoscan/ui/accordion'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import { Tooltip } from '@cosmoscan/ui/tooltip'

export interface AssetStatsProps {
  stats: {
    available: number
    delegatableVesting: number
    delegated: number
    unbonding: number
    rewards: number
    btcDelegationReward: number
    commission: number
  }
}

const toBigInt = (value: number) => BigInt(Math.round(value))

export function AssetStats({ stats }: AssetStatsProps) {
  const total =
    stats.available +
    stats.delegatableVesting +
    stats.delegated +
    stats.unbonding +
    stats.rewards +
    stats.btcDelegationReward +
    stats.commission

  return (
    <div className="-ml-2">
      <Accordion type="single" collapsible>
        <AccordionItem value="details" className="border-none">
          <AccordionTrigger
            showArrow={false}
            className="group relative w-full rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex w-full items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <AmountLabel
                  amount={toBigInt(total)}
                  isChainNativeToken
                  className="text-base font-medium"
                />
                <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-gray-600">
                  <span>Details</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="overflow-hidden">
            <div className="mt-2 overflow-hidden rounded-md border border-gray-100 bg-white transition-all duration-200 dark:border-gray-700 dark:bg-gray-800">
              {/* Available Assets */}
              <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
                <div className="mb-1.5 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-500" />
                  <Tooltip content="Assets available for transfer or delegation">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Available Assets
                    </span>
                  </Tooltip>
                </div>
                <div className="space-y-1 pl-6">
                  <div className="flex justify-between">
                    <Tooltip content="Tokens available for immediate use">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Available
                      </span>
                    </Tooltip>
                    <AmountLabel
                      amount={toBigInt(stats.available)}
                      isChainNativeToken
                      className="text-sm"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Tooltip content="Vested tokens that can be delegated">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Delegatable Vesting
                      </span>
                    </Tooltip>
                    <AmountLabel
                      amount={toBigInt(stats.delegatableVesting)}
                      isChainNativeToken
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Staking */}
              <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
                <div className="mb-1.5 flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-gray-500" />
                  <Tooltip content="Tokens used in staking operations">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Staking
                    </span>
                  </Tooltip>
                </div>
                <div className="space-y-1 pl-6">
                  <div className="flex justify-between">
                    <Tooltip content="Tokens currently delegated to validators">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Delegated
                      </span>
                    </Tooltip>
                    <AmountLabel
                      amount={toBigInt(stats.delegated)}
                      isChainNativeToken
                      className="text-sm"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Tooltip content="Tokens in the process of unbonding">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Unbonding
                      </span>
                    </Tooltip>
                    <AmountLabel
                      amount={toBigInt(stats.unbonding)}
                      isChainNativeToken
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div className="px-3 py-2">
                <div className="mb-1.5 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-gray-500" />
                  <Tooltip content="Earned rewards from various activities">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rewards
                    </span>
                  </Tooltip>
                </div>
                <div className="space-y-1 pl-6">
                  <div className="flex justify-between">
                    <Tooltip content="Rewards earned from staking tokens">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Staking Rewards
                      </span>
                    </Tooltip>
                    <AmountLabel
                      amount={toBigInt(stats.rewards)}
                      isChainNativeToken
                      className="text-sm"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Tooltip content="Rewards earned from BTC delegation">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        BTC Delegation
                      </span>
                    </Tooltip>
                    <AmountLabel
                      amount={toBigInt(stats.btcDelegationReward)}
                      isChainNativeToken
                      className="text-sm"
                    />
                  </div>
                  {stats.commission > 0 && (
                    <div className="flex justify-between">
                      <Tooltip content="Commission earned as a validator">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Commission
                        </span>
                      </Tooltip>
                      <AmountLabel
                        amount={toBigInt(stats.commission)}
                        isChainNativeToken
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
