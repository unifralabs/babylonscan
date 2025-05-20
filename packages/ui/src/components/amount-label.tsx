import BigNumber from 'bignumber.js'

import { BTC_CURRENCY } from '@cosmoscan/shared/constants/btc'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { formatNumWithCommas, formatUnits } from '@cosmoscan/shared/utils'

export interface AmountLabelProps {
  className?: string
  amount?: bigint | null
  decimals?: number
  decimalPlaces?: number
  currency?: string
  isChainNativeToken?: boolean
  showCurrency?: boolean
}

export function AmountLabel({
  className,
  amount,
  decimals = 8,
  decimalPlaces,
  currency = BTC_CURRENCY,
  isChainNativeToken = false,
  showCurrency = true,
}: AmountLabelProps) {
  const formattedValue = formatUnits(
    amount ?? 0n,
    !!isChainNativeToken ? CURRENT_CHAIN.nativeToken.decimals : decimals,
  )
  return (
    <span className={className}>
      {formatNumWithCommas(
        undefined === decimalPlaces
          ? formattedValue
          : BigNumber(formattedValue).toFixed(decimalPlaces),
      )}
      {!showCurrency
        ? ''
        : ` ${
            !!isChainNativeToken ? CURRENT_CHAIN.nativeToken.symbol : currency
          }`}
    </span>
  )
}
