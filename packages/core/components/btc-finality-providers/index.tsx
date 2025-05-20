import { serverApi } from '../../trpc/server'
import { getTranslations } from 'next-intl/server'

import { formatNumWithCommas } from '@cosmoscan/shared/utils'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import { StatisticalDataCards } from '@cosmoscan/ui/components/statistical-data-card'
import {
  PeopleIcon,
  ProvidersIcon,
  StakeIcon,
} from '@cosmoscan/ui/icons/statistical'

export async function TotalStake() {
  const data = await serverApi.internal.stat.fetchBtcTotalStakeSats()
  return <AmountLabel amount={BigInt(Number(data ?? 0))} />
}

export async function FpCount() {
  const data =
    await serverApi.internal.stat.fetchBtcTotalFinalityProvidersCount()
  return data ? formatNumWithCommas(data) : '-'
}

export async function StakersCount() {
  const data = await serverApi.internal.stat.fetchBtcTotalStakersCount()
  return data ? formatNumWithCommas(data) : '-'
}

export async function BtcFpStatisticalData() {
  const t = await getTranslations('FinalityProvider')

  const StatisticalData = [
    {
      icon: StakeIcon,
      label: t('totalConfirmedStake'),
      value: <TotalStake />,
    },
    {
      icon: ProvidersIcon,
      label: t('finalityProviders'),
      value: <FpCount />,
    },
    {
      icon: PeopleIcon,
      label: t('stakers'),
      value: <StakersCount />,
    },
  ]

  return (
    <StatisticalDataCards
      className="gap-page-gap lg:gap-gap grid w-full grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"
      items={StatisticalData}
    />
  )
}
