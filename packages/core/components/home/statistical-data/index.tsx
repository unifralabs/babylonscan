import { serverApi } from '../../../trpc/server'
import ExternalLinkRenderer from '../../external-link-renderer'
import { getTranslations } from 'next-intl/server'

import { formatNumWithCommas, intlFormatNum } from '@cosmoscan/shared/utils'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'

export async function TotalStake() {
  const data = await serverApi.internal.stat.fetchTotalStakeSats()
  return (
    <div>
      <AmountLabel amount={BigInt(Number(data ?? 0))} decimalPlaces={2}/>
    </div>
  )
}

export async function Stakers() {
  const data = await serverApi.internal.stat.fetchTotalStakersCount()
  return formatNumWithCommas(data).toString()
}

export async function FinalityProviders() {
  const t = await getTranslations('Common')
  const data = await serverApi.internal.stat.fetchTotalFinalityProvidersCount()

  return (
    <div className="flex-items-c gap-6">
      <div className="flex-items-c gap-2">
        <span className="text-base font-normal">{t('active')}:</span>
        <span>{formatNumWithCommas(data.active)}</span>
      </div>
      <div className="flex-items-c gap-2">
        <span className="text-base font-normal">{t('standby')}:</span>
        <span>{formatNumWithCommas(data.standby)}</span>
      </div>
    </div>
  )
}

export async function Delegations() {
  const data = await serverApi.internal.stat.fetchTotalDelegationsCount()
  return intlFormatNum(data)
}

export async function SupportedChains() {
  const data = await serverApi.internal.stat.fetchTotalSupportedChainsCount()
  return formatNumWithCommas(data)
}

export async function AverageBlockTime() {
  const data = await serverApi.internal.stat.fetchAverageBlockTime()
  return `${formatNumWithCommas(data)} Second${data > 1 ? 's' : ''}`
}

export async function Transactions() {
  const data = await serverApi.internal.stat.fetchTotalTransactionsCount()
  return intlFormatNum(data)
}

export async function Validators() {
  const t = await getTranslations('Common')
  const data = await serverApi.internal.stat.fetchTotalValidatorsCount()

  return (
    <div className="flex-items-c gap-6">
      <div className="flex-items-c gap-2">
        <span className="text-base font-normal">{t('active')}:</span>
        <span>{formatNumWithCommas(data.active)}</span>
      </div>
      <div className="flex-items-c gap-2">
        <span className="text-base font-normal">{t('standby')}:</span>
        <span>{formatNumWithCommas(data.standby)}</span>
      </div>
    </div>
  )
}

export async function LatestBlock() {
  const data = await serverApi.internal.block.fetchLatestBlock()

  return !!!data ? (
    '-'
  ) : (
    <ExternalLinkRenderer
      type="block"
      pathParamValue={data}
      content={formatNumWithCommas(data)}
    />
  )
}

export async function WalletAddresses() {
  const data = await serverApi.internal.stat.fetchTotalWalletAddressesCount()

  return formatNumWithCommas(data)
}

