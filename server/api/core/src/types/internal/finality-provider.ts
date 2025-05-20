import { InternalRouterInputs, InternalRouterOutputs } from '../root'

import {
  FinalityProvidersStatusEnum,
  StakingTransactionStakingStatusEnum,
} from '@cosmoscan/shared/types'

export type InternalFinalityProviderRouterInputs =
  InternalRouterInputs['finalityProvider']

export type InternalFinalityProviderRouterOutputs =
  InternalRouterOutputs['finalityProvider']

// Finality Providers List
export type FinalityProviderListInput =
  InternalFinalityProviderRouterInputs['fetchInfiniteFinalityProviders']

export type FinalityProviderList =
  InternalFinalityProviderRouterOutputs['fetchInfiniteFinalityProviders']['items']

export type FinalityProviderListItem = FinalityProviderList[number]

// Finality Provider Detail
export type FinalityProviderDetail = NonNullable<
  InternalFinalityProviderRouterOutputs['fetchFinalityProviderDetail']
>

export type FinalityProviderMetadata = {
  moniker: string
  website?: string
  details?: string
  identity?: string
  security_contact?: string
}

// Finality Provider Stakers List
export type FinalityProviderStakersListInput =
  InternalFinalityProviderRouterInputs['fetchInfiniteFinalityProviderStakers']

export type FinalityProviderStakersList =
  InternalFinalityProviderRouterOutputs['fetchInfiniteFinalityProviderStakers']['items']

export type FinalityProviderStakersListItem =
  FinalityProviderStakersList[number]

// BTC Finality Providers List
export type BtcFinalityProviderDailyStatisticalChartData = {
  timestamp: number
  amount: number
  stakers: number
}

export type BtcFinalityProvider = {
  btc_pk: string
  name: string
  status: FinalityProvidersStatusEnum
  commission: string
  stakers: string
  total_sat: string
  stakers_growth: string
  stakers_growth_percentage?: null
  total_sat_growth: string
  total_sat_growth_percentage?: null
  daily_data: BtcFinalityProviderDailyStatisticalChartData[]
}

export type BtcFinalityProviderListInput =
  InternalFinalityProviderRouterInputs['fetchBtcInfiniteFinalityProviders']

export type BtcFinalityProviderList =
  InternalFinalityProviderRouterOutputs['fetchBtcInfiniteFinalityProviders']['items']

export type BtcFinalityProviderListItem = BtcFinalityProviderList[number]

export type BtcFinalityProviderStatisticalData = {
  commission: string
  stakers: string
  total_sat: string
  stakers_growth_percentage?: null
  total_sat_growth_percentage?: null
}

// BTC FP Staking Transactions List
export type BtcFpStakingTransactionsInput =
  InternalFinalityProviderRouterInputs['fetchInfiniteBtcFpStakingTransactions']

export type BtcFpStakingTransactions =
  InternalFinalityProviderRouterOutputs['fetchInfiniteBtcFpStakingTransactions']['items']

export type BtcFpStakingTransactionsItem = {
  id: number
  status: StakingTransactionStakingStatusEnum
  staking_tx_hash: string
  staking_peroid: string
  staking_timestamp: bigint
  total_sat: string
  staker: string
  finality_providers?: { name: string; btc_pk: string; status?: string }[]
}
