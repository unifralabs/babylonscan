import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalAddressRouterInputs = InternalRouterInputs['address']

export type InternalAddressRouterOutputs = InternalRouterOutputs['address']

// Address Detail
export type AddressDetail = InternalAddressRouterOutputs['fetchAddressMetaData']

// Address Portfolio
export type AddressPortfolioListInput =
  InternalAddressRouterInputs['fetchAddressPortfolio']

export type AddressPortfolioList =
  InternalAddressRouterOutputs['fetchAddressPortfolio']['items']

export type AddressPortfolioListItem = AddressPortfolioList[number]

// Address Reward History
export type AddressRewardHistoryInput =
  InternalAddressRouterInputs['fetchAddressRewardsHistory']

export type AddressRewardHistory =
  InternalAddressRouterOutputs['fetchAddressRewardsHistory']['items']

export type AddressRewardHistoryItem = AddressRewardHistory[number]
