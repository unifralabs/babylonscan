import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { formatNumWithCommas, intlFormatNum } from '@cosmoscan/shared/utils'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'

interface ValidatorMetrics {
  totalUbbnStaked: number
  lastEpochRewards: number
  avgApy: number
  validatorCount: number
}

export function TotalStakeBBN({ data }: { data: ValidatorMetrics }) {
  return (
    <div>
      <AmountLabel amount={BigInt(data.totalUbbnStaked)} isChainNativeToken={true} decimalPlaces={2} currency={CURRENT_CHAIN.nativeToken.symbol}/>
    </div>
  )
}

export function LastEpochRewards({ data }: { data: ValidatorMetrics }) {
  return intlFormatNum(data.lastEpochRewards)
}

export function AverageAPY({ data }: { data: ValidatorMetrics }) {
  return `${data.avgApy.toFixed(2)}%`
}

export function ValidatorsCount({ data }: { data: ValidatorMetrics }) {
  return formatNumWithCommas(data.validatorCount)
} 